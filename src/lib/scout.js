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
  const nr = sv[idx]; return nr ? { nr, name: '' } : null
}

export function statsRows(scout, team, roster) {
  const by = {}
  scout.events.filter(e => e.type === 'touch' && e.team === team).forEach(e => {
    const key = e.playerNr || '?'
    const mk = k => by[k] || (by[k] = { nr: k, name: (roster.find(p => p.nr === k) || {}).name || '', rec: [], att: [], srv: [], blk: 0, ass: 0, dig: 0 })
    const r = mk(key)
    if (e.act === 'receptie') r.rec.push(e.q); if (e.act === 'aanval') r.att.push(e.q); if (e.act === 'opslag') r.srv.push(e.q)
    if (e.act === 'blok' && e.q === '#') { r.blk++; (e.assists || []).forEach(a => { mk(a.nr || '?').ass++ }) }
    if (e.act === 'verdediging') r.dig++
  })
  const pct = (a, ok) => a.length ? Math.round(100 * a.filter(q => ok.includes(q)).length / a.length) + '%' : ''
  return Object.values(by).map(r => ({
    nr: r.nr, name: r.name, recN: r.rec.length, recPos: pct(r.rec, ['#', '+']), recErr: r.rec.filter(q => q === '=').length,
    attN: r.att.length, kills: r.att.filter(q => q === '#').length, attErr: r.att.filter(q => q === '=' || q === '/').length,
    eff: r.att.length ? Math.round(100 * (r.att.filter(q => q === '#').length - r.att.filter(q => q === '=' || q === '/').length) / r.att.length) + '%' : '',
    srvN: r.srv.length, aces: r.srv.filter(q => q === '#').length, srvErr: r.srv.filter(q => q === '=').length, blk: r.blk, ass: r.ass, dig: r.dig,
  })).sort((a, b) => (+a.nr || 99) - (+b.nr || 99))
}
export function scoutCsv(scout, teamName, oppName) {
  const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`
  const t = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const rows = [['Set', 'Tijd', 'Type', 'Ploeg', 'Actie', 'Zone', 'Kwaliteit', 'Rugnummer', 'Libero', 'StandWij', 'StandZij', 'RotWij', 'RotZij']]
  scout.events.forEach(e => rows.push([e.set + 1, t(e.t), e.type, e.team === 'us' ? teamName : oppName, e.act || e.what || '', e.zone || '', e.q || '', e.playerNr || '', e.lib ? 'ja' : '', e.us ?? '', e.them ?? '', e.rotUs ?? '', e.rotThem ?? '']))
  return '\ufeff' + rows.map(r => r.map(q).join(';')).join('\r\n')
}

// --- side-out per rotatie (ontvangen rallies gewonnen / ontvangen rallies), en break per rotatie
export function rotationStats(match, scout, roster) {
  const rows = Array.from({ length: 6 }, (_, r) => ({ rot: r, recv: 0, so: 0, serve: 0, brk: 0 }))
  match.sets.forEach((st, setIdx) => {
    if (!(st.locked || st.us !== '' || st.them !== '')) return
    let serve = scout.serveFirst[setIdx] || 'us', rotUs = 0, rotThem = 0
    scout.events.filter(e => e.set === setIdx).forEach(e => {
      if (e.type === 'adj') { if (e.what === 'serve') serve = serve === 'us' ? 'them' : 'us'; if (e.what === 'rotUs') rotUs = (rotUs + 1) % 6; if (e.what === 'rotThem') rotThem = (rotThem + 1) % 6; return }
      if (e.type !== 'point') return
      const row = rows[rotUs]
      if (serve === 'them') { row.recv++; if (e.team === 'us') row.so++ } else { row.serve++; if (e.team === 'us') row.brk++ }
      if (e.team === 'us') { if (serve === 'them') { serve = 'us'; rotUs = (rotUs + 1) % 6 } }
      else { if (serve === 'us') { serve = 'them'; rotThem = (rotThem + 1) % 6 } }
    })
  })
  // wie serveert in deze rotatie (starter op I bij rotatie r, uit set 1)
  const st = match.sets[0]
  rows.forEach(r => { const k = baseIndex(r.rot, ZONE_TO_D[1]); const p = roster.find(x => x.id === st.pos[k]); r.server = p ? (p.nr || p.name) : '' })
  return rows.map(r => ({ ...r, soPct: r.recv ? Math.round(100 * r.so / r.recv) : null, brkPct: r.serve ? Math.round(100 * r.brk / r.serve) : null }))
}
// --- aanvalsrichtingen per speler: [{from, to, q}]
export function attackDirections(scout, team) {
  const by = {}
  scout.events.filter(e => e.type === 'touch' && e.team === team && e.act === 'aanval' && e.zone).forEach(e => {
    const key = e.playerNr || '?'; (by[key] || (by[key] = [])).push({ from: e.zone, to: e.to || null, q: e.q })
  })
  return by
}
// --- bankmodus: 3 niveaus -> symbolen
export const SIMPLE_Q = { receptie: [['goed', '+'], ['matig', '!'], ['fout', '=']], aanval: [['punt', '#'], ['in spel', '!'], ['geblokt', '/'], ['fout', '=']], opslag: [['ace', '#'], ['in spel', '!'], ['fout', '=']], blok: [['blokpunt', '#'], ['vertraagd', '+'], ['in spel', '!'], ['touch out', '-'], ['fout', '=']], verdediging: [['goed', '+'], ['matig', '!'], ['fout', '=']], pas: [['goed', '+'], ['matig', '!'], ['fout', '=']] }

// --- labels per actie bij de Data Volley-symbolen; null = symbool niet van toepassing bij deze actie
export const Q_LABELS = {
  opslag:      { '#': 'ace', '+': 'goed', '!': 'neutraal', '-': 'makkelijk', '/': null, '=': 'fout' },
  receptie:    { '#': 'perfect', '+': 'goed', '!': 'matig', '-': 'slecht', '/': null, '=': 'ace tegen' },
  pas:         { '#': 'perfect', '+': 'goed', '!': 'matig', '-': 'slecht', '/': null, '=': 'fout' },
  aanval:      { '#': 'kill', '+': 'goed', '!': 'in spel', '-': 'tegenaanval', '/': 'geblokt', '=': 'fout' },
  blok:        { '#': 'blokpunt', '+': 'vertraagd', '!': 'in spel', '-': 'touch out', '/': null, '=': 'fout' },
  verdediging: { '#': 'perfect', '+': 'goed', '!': 'matig', '-': 'slecht', '/': null, '=': 'fout' },
}
// welke zones zijn zinvol per actie (null = alle zes)
export const ZONES_FOR = { opslag: [1], receptie: [1, 5, 6], pas: null, aanval: null, blok: [2, 3, 4], verdediging: [1, 5, 6] }

// --- slim taggen: wat volgt logisch op deze tag?
//   {point:'us'|'them'}          rally is beslist, punt toekennen
//   {askBlock:true}              aanval geblokt: vraag welke blokker, dan punt voor de andere ploeg
//   {pending:{team,act,zone}}    volgende tag klaarzetten (zone null = speler nog te kiezen)
export function nextStep(e, opts = {}) {
  const other = e.team === 'us' ? 'them' : 'us', q = e.q
  const afterFirstTouch = () => q === '=' ? { point: other } : opts.tagPas && e.team === 'us' ? { pending: { team: e.team, act: 'pas', zone: null } } : { pending: { team: e.team, act: 'aanval', zone: null } }
  switch (e.act) {
    case 'opslag':      return q === '#' ? { point: e.team } : q === '=' ? { point: other } : { pending: { team: other, act: 'receptie', zone: null } }
    case 'receptie':
    case 'verdediging': return afterFirstTouch()
    case 'pas':         return q === '=' ? { point: other } : { pending: { team: e.team, act: 'aanval', zone: null } }
    case 'aanval':      return q === '#' ? { point: e.team } : q === '=' ? { point: other } : q === '/' ? { askBlock: true } : { pending: { team: other, act: 'verdediging', zone: null } }
    case 'blok':        return q === '#' ? { point: e.team } : (q === '=' || q === '-') ? { point: other } : q === '+' ? { pending: { team: e.team, act: 'verdediging', zone: null } } : { pending: { team: e.team, act: null, zone: null } }
  }
  return {}
}
export const serveStep = serve => ({ team: serve, act: 'opslag', zone: 1 })
// Bankmodus: alleen de eigen ploeg. Zij serveren -> begin bij onze receptie; wij serveren -> onze opslag.
export const benchStart = serve => serve === 'us' ? { team: 'us', act: 'opslag', zone: 1 } : { team: 'us', act: 'receptie', zone: null }
export function benchNext(e, opts = {}) {
  const q = e.q
  switch (e.act) {
    case 'opslag':      return q === '#' ? { point: 'us' } : q === '=' ? { point: 'them' } : { pending: { team: 'us', act: null, zone: null } }   // rally loopt: tik wat je ziet, of het punt
    case 'receptie':
    case 'verdediging': return q === '=' ? { point: 'them' } : opts.tagPas ? { pending: { team: 'us', act: 'pas', zone: null } } : { pending: { team: 'us', act: 'aanval', zone: null } }
    case 'pas':         return q === '=' ? { point: 'them' } : { pending: { team: 'us', act: 'aanval', zone: null } }
    case 'aanval':      return q === '#' ? { point: 'us' } : q === '=' || q === '/' ? { point: 'them' } : { pending: { team: 'us', act: null, zone: null } }
    case 'blok':        return q === '#' ? { point: 'us' } : (q === '=' || q === '-') ? { point: 'them' } : q === '+' ? { pending: { team: 'us', act: 'verdediging', zone: null } } : { pending: { team: 'us', act: null, zone: null } }
  }
  return {}
}

// --- setter op het veld (voor het klaarzetten van de pas): zone van de setter in de huidige rotatie, of null
export function setterZone(match, roster, scout, setIdx, d) {
  for (const z of [1, 2, 3, 4, 5, 6]) { const p = ourPlayerAt(match, roster, scout, setIdx, d, z); if (p && roster.find(r => r.id === p.id)?.set) return z }
  return null
}
// --- spelverdeling: per rotatie het aandeel aanvallen per aanvalszone, gesplitst naar kwaliteit van de voorafgaande receptie/verdediging
export function distribution(scout) {
  const rows = Array.from({ length: 6 }, (_, r) => ({ rot: r, total: 0, zones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, good: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, goodN: 0, bad: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, badN: 0, pas: [] }))
  let prev = null
  scout.events.forEach(e => {
    if (e.type === 'point') { prev = null; return }
    if (e.type !== 'touch') return
    if (e.team === 'us' && e.act === 'aanval' && e.zone) {
      const r = rows[e.rotUs ?? 0]; r.total++; r.zones[e.zone]++
      if (prev && (prev.act === 'receptie' || prev.act === 'verdediging')) { const g = prev.q === '#' || prev.q === '+'; if (g) { r.good[e.zone]++; r.goodN++ } else { r.bad[e.zone]++; r.badN++ } }
    }
    if (e.team === 'us' && e.act === 'pas') rows[e.rotUs ?? 0].pas.push(e.q)
    if (e.team === 'us' && (e.act === 'receptie' || e.act === 'verdediging')) prev = e; else if (e.team === 'us' && e.act === 'pas') { /* prev blijft de eerste bal */ } else if (e.team !== 'us') prev = null
  })
  return rows
}
