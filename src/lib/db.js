import { supabase } from './supabase.js'
import { fixMatch } from './volley.js'

// --- team
export async function myTeams() {
  const { data, error } = await supabase.from('teams').select('id,name,created_at').order('created_at')
  if (error) throw error; return data
}
export async function createTeam(name) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('teams').insert({ name, created_by: user.id }).select().single()
  if (error) throw error; return data
}
export async function renameTeam(id, name) { const { error } = await supabase.from('teams').update({ name }).eq('id', id); if (error) throw error }
export async function addMemberByEmail(teamId, email) { const { error } = await supabase.rpc('add_member_by_email', { t: teamId, email }); if (error) throw error }

// --- spelers (UI-vorm: {id,nr,name,lib,cap})
const toUi = p => ({ id: p.id, nr: p.nr, name: p.name, lib: p.is_libero, cap: p.is_captain })
const toDb = (teamId, p) => ({ team_id: teamId, nr: p.nr || '', name: p.name, is_libero: !!p.lib, is_captain: !!p.cap })
export async function loadPlayers(teamId) {
  const { data, error } = await supabase.from('players').select('*').eq('team_id', teamId).eq('active', true)
  if (error) throw error; return data.map(toUi)
}
export async function addPlayer(teamId, p) {
  const { data, error } = await supabase.from('players').insert(toDb(teamId, p)).select().single()
  if (error) throw error; return toUi(data)
}
export async function updatePlayer(teamId, p) {
  const { error } = await supabase.from('players').update(toDb(teamId, p)).eq('id', p.id); if (error) throw error
}
export async function removePlayer(id) {
  // soft delete: historie blijft naar de speler verwijzen
  const { error } = await supabase.from('players').update({ active: false }).eq('id', id); if (error) throw error
}

// --- wedstrijden (UI-vorm: {id,opp,date,home,sets})
const mToUi = m => ({ ...fixMatch({ id: m.id, opp: m.opponent, date: m.match_date, home: m.home, sets: m.sets }), scout: m.scout || {} })
const mToDb = (teamId, m) => ({ team_id: teamId, opponent: m.opp, match_date: m.date, home: m.home, sets: m.sets })
export async function loadMatches(teamId) {
  const { data, error } = await supabase.from('matches').select('*').eq('team_id', teamId).order('match_date', { ascending: false })
  if (error) throw error; return data.map(mToUi)
}
export async function saveMatch(teamId, m) {
  const row = mToDb(teamId, m)
  const q = m.id ? supabase.from('matches').update(row).eq('id', m.id) : supabase.from('matches').insert(row)
  const { data, error } = await q.select().single()
  if (error) throw error; return mToUi(data)
}
export async function saveScout(matchId, scout) {
  const { data, error } = await supabase.from('matches').update({ scout }).eq('id', matchId).select('scout').single()
  if (error) throw error; return data.scout
}
export async function deleteMatch(id) { const { error } = await supabase.from('matches').delete().eq('id', id); if (error) throw error }

// --- import van de oude single-file app (JSON-export)
export async function importLegacy(teamId, json) {
  const idMap = {}
  for (const p of json.roster || []) { const np = await addPlayer(teamId, p); idMap[p.id] = np.id }
  const remap = id => idMap[id] || ''
  for (const m of json.matches || []) {
    const sets = (m.sets || []).map(st => {
      const s = typeof st.subs === 'string' ? { ...st, notes: st.subs, subs: [] } : st
      return { ...s, pos: (s.pos || []).map(remap), libero: remap(s.libero), subs: (s.subs || []).map(w => ({ ...w, in: remap(w.in), out: remap(w.out) })), hist: [] }
    })
    await saveMatch(teamId, { id: null, opp: m.opp, date: m.date, home: m.home, sets })
  }
  return { players: Object.keys(idMap).length, matches: (json.matches || []).length }
}

// --- backup / herstel (volledige ploeg als JSON)
export async function exportBackup(team) {
  const [players, matches] = await Promise.all([
    supabase.from('players').select('*').eq('team_id', team.id),
    supabase.from('matches').select('*').eq('team_id', team.id),
  ])
  if (players.error) throw players.error; if (matches.error) throw matches.error
  return { format: 'scouting-backup', version: 1, exported_at: new Date().toISOString(), team: { name: team.name }, players: players.data, matches: matches.data }
}
// Herstel in de huidige ploeg: rijen met een bekend id worden bijgewerkt, onbekende toegevoegd. Verwijdert nooit iets.
export async function restoreBackup(teamId, b) {
  if (b.format !== 'scouting-backup' || !Array.isArray(b.players) || !Array.isArray(b.matches)) throw new Error('Geen geldig backupbestand')
  const strip = r => { const { created_at, updated_at, created_by, ...rest } = r; return { ...rest, team_id: teamId } }
  if (b.players.length) { const { error } = await supabase.from('players').upsert(b.players.map(strip), { onConflict: 'id' }); if (error) throw error }
  if (b.matches.length) { const { error } = await supabase.from('matches').upsert(b.matches.map(strip), { onConflict: 'id' }); if (error) throw error }
  return { players: b.players.length, matches: b.matches.length }
}
