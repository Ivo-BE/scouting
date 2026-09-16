// Pure wedstrijdlogica — geen React, geen Supabase. Getest in tests/volley.test.js.

// Weergavevolgorde op het veld: rij aan het net, dan achterrij.
export const POS = [['IV','Linksvoor'],['III','Midvoor'],['II','Rechtsvoor'],['V','Linksachter'],['VI','Midachter'],['I','Rechtsachter']]
// Rotatievolgorde in wijzerzin: I -> VI -> V -> IV -> III -> II -> I (indexen in POS)
export const R = [5,4,3,0,1,2]
export const ROMAN = ['I','II','III','IV','V','VI']

export const uid = () => Math.random().toString(36).slice(2, 9)
export const today = () => new Date().toISOString().slice(0, 10)
export const fmt = d => { if (!d) return ''; const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y.slice(2)}` }

export function newSet() {
  return { pos: ['','','','','',''], libero: '', notes: '', subs: [], timeouts: [], rot: 0, locked: false, us: '', them: '', hist: [] }
}
export function newMatch() { return { id: null, opp: '', date: today(), home: true, sets: Array.from({ length: 5 }, newSet) } }
export function fixSet(st) {
  const s = { ...newSet(), ...st }
  if (typeof s.subs === 'string') { s.notes = s.notes || s.subs; s.subs = [] }
  if (!Array.isArray(s.subs)) s.subs = []
  if (!Array.isArray(s.timeouts)) s.timeouts = []
  if (!Array.isArray(s.hist)) s.hist = []
  if (s.roles && typeof s.roles !== 'object') s.roles = {}
  return s
}
export function fixMatch(m) {
  const sets = (m.sets || []).map(fixSet)
  while (sets.length < 5) sets.push(newSet())
  return { ...m, sets }
}

// --- gespeelde set: bevestigd of met een stand
export const playedSet = st => !!(st.locked || st.us !== '' || st.them !== '')

// --- huidige zes + rotatie
export const lineup = st => { const l = [...st.pos]; st.subs.forEach(w => { l[w.k] = w.in }); return l }
export const dispIndex = (st, k) => R[(R.indexOf(k) + st.rot) % 6]           // startslot -> zichtbare positie
export const baseIndex = (st, d) => R[(R.indexOf(d) - st.rot + 6) % 6]       // zichtbare positie -> startslot
export const score = st => `${st.us || 0}-${st.them || 0}`

// --- wisselregel (FIVB): starter A eruit voor B; daarna mag alleen A terug voor B; koppel is dan afgerond.
export function allowedSubs(st, k, roster) {
  const l = lineup(st); const out = l[k]
  if (!out || st.subs.length >= 6) return []
  const starter = st.pos[k]
  if (st.subs.filter(w => w.k === k).length >= 2) return []
  if (out !== starter) return roster.filter(p => p.id === starter)
  const busy = new Set(st.subs.flatMap(w => [w.in, w.out])); const onCourt = new Set(l)
  return roster.filter(p => !onCourt.has(p.id) && p.id !== st.libero && !p.lib && !busy.has(p.id) && !st.pos.includes(p.id))
}

// --- setlogica: 25 (15 in set 5) met 2 verschil
export function setWinner(st, i) {
  const a = +st.us || 0, b = +st.them || 0, t = i === 4 ? 15 : 25
  if (Math.max(a, b) < t || Math.abs(a - b) < 2) return null
  return a > b ? 'us' : 'them'
}
export function matchState(m) {
  let w = 0, l = 0
  m.sets.forEach((st, i) => { const r = setWinner(st, i); if (r === 'us') w++; else if (r === 'them') l++ })
  return { w, l, over: w === 3 || l === 3 }
}

// --- ongedaan maken (per set)
export function snap(st, what) {
  const h = [...st.hist, { what, us: st.us, them: st.them, timeouts: [...st.timeouts], subs: JSON.parse(JSON.stringify(st.subs)), rot: st.rot }]
  return { ...st, hist: h.slice(-40) }
}
export function undo(st) {
  if (!st.hist.length) return { st, what: null }
  const h = st.hist[st.hist.length - 1]
  return { st: { ...st, us: h.us, them: h.them, timeouts: h.timeouts, subs: h.subs, rot: h.rot, hist: st.hist.slice(0, -1) }, what: h.what }
}

// --- verslag & statistieken
export function reportLines(m, roster, teamName) {
  const player = id => roster.find(p => p.id === id)
  const label = p => p ? `${p.nr ? p.nr + ' ' : ''}${p.name}` : '–'
  const nm = id => label(player(id))
  const sets = m.sets.filter(playedSet)
  const { w, l, over } = matchState(m)
  const L = [`${teamName || 'Ploeg'} – ${m.opp} (${m.home ? 'thuis' : 'uit'}), ${fmt(m.date)}`]
  if (sets.some(st => st.us !== '')) L.push(`Uitslag: ${w}–${l}${over ? (w > l ? ' gewonnen' : ' verloren') : ''}  (${sets.map(st => `${st.us || '?'}-${st.them || '?'}`).join(', ')})`)
  sets.forEach((st, i) => {
    L.push(''); L.push(`Set ${i + 1}${st.us !== '' || st.them !== '' ? `  ${st.us}-${st.them}` : ''}`)
    L.push(`  Start: ${ROMAN.map(r => r + ' ' + nm(st.pos[POS.findIndex(x => x[0] === r)])).join(' | ')}`)
    if (st.libero) L.push(`  Libero: ${nm(st.libero)}`)
    if (st.subs.length) L.push(`  Wissels: ${st.subs.map(x => `${nm(x.out)} uit, ${nm(x.in)} in${x.score ? ' bij ' + x.score : ''}`).join('; ')}`)
    if (st.timeouts.length) L.push(`  Time-outs: ${st.timeouts.join(', ')}`)
    if (st.notes) L.push(`  Notities: ${st.notes}`)
  })
  return L
}
export function stats(roster, matches) {
  const S = {}
  roster.forEach(p => { S[p.id] = { p, matches: new Set(), started: 0, subbed: 0, libero: 0, pos: { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 } } })
  matches.forEach(m => m.sets.forEach(st => {
    if (!playedSet(st) || !st.pos.some(Boolean)) return
    st.pos.forEach((id, d) => { if (S[id]) { S[id].started++; S[id].pos[POS[d][0]]++; S[id].matches.add(m.id) } })
    st.subs.forEach(w => { if (S[w.in] && w.in !== st.pos[w.k]) { S[w.in].subbed++; S[w.in].matches.add(m.id) } })
    if (S[st.libero]) { S[st.libero].libero++; S[st.libero].matches.add(m.id) }
  }))
  return Object.values(S)
}
export function csv(matches, roster) {
  const nm = id => { const p = roster.find(x => x.id === id); return p ? `${p.nr ? p.nr + ' ' : ''}${p.name}` : '' }
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [['Datum','Tegenstander','Thuis/Uit','Set','Wij','Zij','I','II','III','IV','V','VI','Libero','Wissels','Time-outs','Notities']]
  ;[...matches].sort((a, b) => a.date.localeCompare(b.date)).forEach(m => m.sets.forEach((st, i) => {
    if (!playedSet(st)) return
    rows.push([m.date, m.opp, m.home ? 'thuis' : 'uit', i + 1, st.us, st.them, ...ROMAN.map(r => nm(st.pos[POS.findIndex(x => x[0] === r)])), nm(st.libero),
      st.subs.map(w => `${nm(w.out)} uit, ${nm(w.in)} in${w.score ? ' bij ' + w.score : ''}`).join('; '), st.timeouts.join(', '), st.notes])
  }))
  return '\ufeff' + rows.map(r => r.map(q).join(';')).join('\r\n')
}
