// Pure scout-logica: rotatie afleiden uit punten, speler afleiden uit zone. Getest in tests/scout.test.js.
import { POS, R, baseIndex as _base } from './volley.js'

export const ZONE_TO_D = { 1: 5, 2: 2, 3: 1, 4: 0, 5: 3, 6: 4 }   // zone -> weergave-index in POS
export const D_TO_ZONE = { 5: 1, 2: 2, 1: 3, 0: 4, 3: 5, 4: 6 }
const BACK = new Set([1, 5, 6])
export const ACTIONS = [['opslag', 'S'], ['receptie', 'R'], ['pas', 'P'], ['aanval', 'A'], ['blok', 'B'], ['verdediging', 'V']]
export const QUALITIES = [['#', 'perfect / punt'], ['+', 'goed'], ['!', 'matig'], ['-', 'slecht'], ['/', 'geblokt / afgeweerd'], ['=', 'fout']]
const baseIndex = (rot, d) => _base({ rot }, d)

export function emptyScout() { return { serveFirst: {}, oppServers: {}, oppFirstRot: {}, events: [] } }
export const fixScout = s => ({ ...emptyScout(), ...(s || {}) })

// Afgeleide toestand voor één set: stand, wie serveert, rotaties, huidige zes (startslots).
export function derive(match, scout, setIdx) {
  const st = match.sets[setIdx]
  let us = 0, them = 0, serve = scout.serveFirst[setIdx] || 'us', rotUs = 0, rotThem = 0
  const lineup = [...st.pos]
  const subsAt = sc => (st.subs || []).filter(w => w.score === sc)
  subsAt('0-0').forEach(w => { lineup[w.k] = w.in })
  for (const e of scout.events) {
    if (e.set !== setIdx) continue
    if (e.type === 'point') {
      if (e.team === 'us') { us++; if (serve === 'them') { serve = 'us'; rotUs = (rotUs + 1) % 6 } }
      else { them++; if (serve === 'us') { serve = 'them'; rotThem = (rotThem + 1) % 6 } }
      subsAt(`${us}-${them}`).forEach(w => { lineup[w.k] = w.in })
    } else if (e.type === 'adj') {
      if (e.what === 'serve') serve = serve === 'us' ? 'them' : 'us'
      if (e.what === 'rotUs') rotUs = (rotUs + 1) % 6
      if (e.what === 'rotThem') rotThem = (rotThem + 1) % 6
      if (e.what === 'sub') lineup[e.k] = e.in
    }
  }
  return { us, them, serve, rotUs, rotThem, lineup, servers: scout.oppServers[setIdx] || [] }
}

// Wie staat er (voor ons) in deze zone? opts: {libFor: startslot-speler-id die de libero vervangt, forceLib}
export function ourPlayerAt(match, roster, scout, setIdx, d, zone, opts = {}) {
  const st = match.sets[setIdx]
  const k = baseIndex(d.rotUs, ZONE_TO_D[zone])
  const libHere = BACK.has(zone) && ((opts.libFor && st.pos[k] === opts.libFor) || opts.forceLib)
  if (libHere) { const l = roster.find(p => p.id === st.libero); if (l) return { id: l.id, nr: l.nr, name: l.name, lib: true } }
  const p = roster.find(p => p.id === d.lineup[k]); return p ? { id: p.id, nr: p.nr, name: p.name } : null
}
// Tegenstander: opslagvolgorde = hun zones 1..6 op het moment van de eerste server; daarna rotatie.
export function oppPlayerAt(scout, setIdx, d, zone) {
  const sv = d.servers; if (!sv.length) return null
  const rot = ((d.rotThem - (scout.oppFirstRot[setIdx] || 0)) % 6 + 6) % 6
  const k = baseIndex(rot, ZONE_TO_D[zone])
  const idx = [5, 2, 1, 0, 3, 4].indexOf(k)      // startslot -> plaats in opslagvolgorde (zone 1 = idx 0)
  const nr = sv[idx]; return nr ? { nr, name: '#' + nr } : null
}

export function statsRows(scout, team, roster) {
  const by = {}
  scout.events.filter(e => e.type === 'touch' && e.team === team).forEach(e => {
    const key = e.playerNr || '?'
    const r = by[key] || (by[key] = { nr: key, name: (roster.find(p => p.nr === key) || {}).name || '', rec: [], att: [], srv: [], blk: 0, dig: 0 })
    if (e.act === 'receptie') r.rec.push(e.q); if (e.act === 'aanval') r.att.push(e.q); if (e.act === 'opslag') r.srv.push(e.q)
    if (e.act === 'blok' && e.q === '#') r.blk++; if (e.act === 'verdediging') r.dig++
  })
  const pct = (a, ok) => a.length ? Math.round(100 * a.filter(q => ok.includes(q)).length / a.length) + '%' : ''
  return Object.values(by).map(r => ({
    nr: r.nr, name: r.name, recN: r.rec.length, recPos: pct(r.rec, ['#', '+']), recErr: r.rec.filter(q => q === '=').length,
    attN: r.att.length, kills: r.att.filter(q => q === '#').length, attErr: r.att.filter(q => q === '=' || q === '/').length,
    eff: r.att.length ? Math.round(100 * (r.att.filter(q => q === '#').length - r.att.filter(q => q === '=' || q === '/').length) / r.att.length) + '%' : '',
    srvN: r.srv.length, aces: r.srv.filter(q => q === '#').length, srvErr: r.srv.filter(q => q === '=').length, blk: r.blk, dig: r.dig,
  })).sort((a, b) => (+a.nr || 99) - (+b.nr || 99))
}
export function scoutCsv(scout, teamName, oppName) {
  const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`
  const t = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const rows = [['Set', 'Tijd', 'Type', 'Ploeg', 'Actie', 'Zone', 'Kwaliteit', 'Rugnummer', 'Libero', 'StandWij', 'StandZij', 'RotWij', 'RotZij']]
  scout.events.forEach(e => rows.push([e.set + 1, t(e.t), e.type, e.team === 'us' ? teamName : oppName, e.act || e.what || '', e.zone || '', e.q || '', e.playerNr || '', e.lib ? 'ja' : '', e.us ?? '', e.them ?? '', e.rotUs ?? '', e.rotThem ?? '']))
  return '\ufeff' + rows.map(r => r.map(q).join(';')).join('\r\n')
}
