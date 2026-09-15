import { useEffect, useRef, useState } from 'react'
import { POS } from '../lib/volley.js'
import { ACTIONS, QUALITIES, D_TO_ZONE, derive, ourPlayerAt, oppPlayerAt, statsRows, scoutCsv, fixScout } from '../lib/scout.js'
import Modal from './Modal.jsx'

const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const uid = () => Math.random().toString(36).slice(2, 9)

export default function Scout({ matches, roster, teamName, onSaveScout, flash }) {
  const [matchId, setMatchId] = useState(matches[0]?.id || '')
  const match = matches.find(m => m.id === matchId)
  const [scout, setScout] = useState(() => fixScout(match?.scout))
  const [set, setSet] = useState(0)
  const [pending, setPending] = useState({ team: null, act: null, zone: null, lib: false })
  const [libFor, setLibFor] = useState('')
  const [modal, setModal] = useState(null)
  const [videoName, setVideoName] = useState('')
  const v = useRef(); const saveT = useRef()

  useEffect(() => { setScout(fixScout(match?.scout)); setSet(0) }, [matchId])
  useEffect(() => {              // autosave 1 s na laatste wijziging
    if (!match) return
    clearTimeout(saveT.current); saveT.current = setTimeout(() => onSaveScout(match, scout), 1000)
    return () => clearTimeout(saveT.current)
  }, [scout])

  if (!match) return <section className="panel"><h2>Scout</h2><p className="hint">Bewaar eerst een wedstrijd met startopstellingen; die kies je hier dan om te analyseren.</p></section>
  const d = derive(match, scout, set)
  const now = () => v.current?.currentTime || 0
  const playerAt = (team, zone) => team === 'us' ? ourPlayerAt(match, roster, scout, set, d, zone, { libFor, forceLib: pending.lib }) : oppPlayerAt(scout, set, d, zone)
  const push = e => setScout(s => ({ ...s, events: [...s.events, { id: uid(), set, t: now(), ...e }] }))

  function tag(q) {
    const p = pending; if (!p.team || !p.act || !p.zone) { flash('Kies eerst ploeg, actie en zone'); return }
    if (p.team === 'them' && p.act === 'opslag') {
      const sv = scout.oppServers[set] || []
      const known = sv.length >= 6 ? playerAt('them', 1)?.nr : ''
      const nr = prompt(`Rugnummer van de server (${match.opp})`, known || ''); if (nr === null) return
      const nsv = sv.length < 6 && !sv.includes(nr) ? [...sv, nr] : sv
      setScout(s => ({ ...s, oppServers: { ...s.oppServers, [set]: nsv }, oppFirstRot: sv.length === 0 ? { ...s.oppFirstRot, [set]: d.rotThem } : s.oppFirstRot }))
      commit(q, { nr, name: '#' + nr }); return
    }
    commit(q, playerAt(p.team, p.zone))
  }
  function commit(q, pl) {
    const p = pending
    push({ type: 'touch', team: p.team, act: p.act, zone: p.zone, q, playerId: pl?.id || '', playerNr: pl?.nr || '', lib: !!pl?.lib, rotUs: d.rotUs, rotThem: d.rotThem, us: d.us, them: d.them })
    setPending({ team: p.team, act: null, zone: null, lib: false })
  }
  function point(team) { push({ type: 'point', team, us: d.us + (team === 'us'), them: d.them + (team === 'them') }); setPending({ team: null, act: null, zone: null, lib: false }) }
  function undo() { const ev = scout.events.filter(e => e.set === set); const last = ev[ev.length - 1]; if (last) setScout(s => ({ ...s, events: s.events.filter(e => e.id !== last.id) })) }
  function sub() {
    const opts = match.sets[set].pos.map((id, k) => { const p = roster.find(x => x.id === d.lineup[k]); return `${k}: ${p ? p.nr + ' ' + p.name : '?'}` }).join('\n')
    const k = prompt('Welk startslot gaat eruit?\n' + opts); if (k === null) return
    const nr = prompt('Rugnummer van wie erin komt'); const p = roster.find(x => x.nr === nr); if (!p) { flash('Onbekend rugnummer'); return }
    push({ type: 'adj', what: 'sub', k: +k, in: p.id })
  }

  useEffect(() => {
    const h = e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || modal) return
      const k = e.key.toLowerCase(); const vid = v.current
      if (e.key === ' ') { e.preventDefault(); vid?.paused ? vid?.play() : vid?.pause(); return }
      if (e.key === 'ArrowLeft') { if (vid) vid.currentTime -= 5; return } if (e.key === 'ArrowRight') { if (vid) vid.currentTime += 5; return }
      if (k === 'w') setPending(p => ({ ...p, team: 'us' })); else if (k === 't') setPending(p => ({ ...p, team: 'them' }))
      else if (ACTIONS.some(a => a[1].toLowerCase() === k)) setPending(p => ({ ...p, act: ACTIONS.find(a => a[1].toLowerCase() === k)[0] }))
      else if ('123456'.includes(e.key) && e.key) setPending(p => ({ ...p, zone: +e.key }))
      else if (QUALITIES.some(q => q[0] === e.key)) tag(e.key)
      else if (k === 'q') point('us'); else if (k === 'e') point('them'); else if (k === 'z') undo(); else if (k === 'l') setPending(p => ({ ...p, lib: !p.lib }))
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })

  const Court = ({ team }) => <div className="court"><div className="floor">{POS.map((p, dd) => { const z = D_TO_ZONE[dd]; const pl = playerAt(team, z)
    return <div key={dd} className={'pos scell' + (pending.zone === z && pending.team === team ? ' sel' : '') + (pl?.lib ? ' lib' : '')} onClick={() => setPending(pp => ({ ...pp, team, zone: z }))}><small>{p[0]} · z{z}</small><b>{pl ? (pl.nr || pl.name) : '?'}</b></div> })}</div></div>
  const ev = scout.events.filter(e => e.set === set).slice(-80).reverse()
  const log = e => e.type === 'point' ? `Punt ${e.team === 'us' ? teamName : match.opp} → ${e.us}-${e.them}` : e.type === 'adj' ? `Aanpassing: ${e.what}` : `${e.team === 'us' ? teamName : match.opp} · ${e.act} z${e.zone} ${e.q} · #${e.playerNr || '?'}${e.lib ? ' (L)' : ''}`

  return <div className="scout">
    <section className="panel scout-left">
      <div className="row wrap">
        <select value={matchId} onChange={e => setMatchId(e.target.value)}>{matches.map(m => <option key={m.id} value={m.id}>{m.date} · {m.opp}</option>)}</select>
        <label className="filebtn"><input type="file" accept="video/*" hidden onChange={e => { const f = e.target.files[0]; if (f) { v.current.src = URL.createObjectURL(f); setVideoName(f.name) } }} />{videoName || 'Video kiezen…'}</label>
        <button onClick={() => setModal('stats')}>Statistieken</button>
        <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([scoutCsv(scout, teamName, match.opp)], { type: 'text/csv;charset=utf-8' })); a.download = `scout-${match.opp}.csv`; a.click() }}>CSV</button>
      </div>
      <video ref={v} controls playsInline />
      <div className="row">
        <button onClick={() => v.current.currentTime -= 5}>−5s</button><button onClick={() => v.current.currentTime -= 1}>−1s</button>
        <button onClick={() => v.current.paused ? v.current.play() : v.current.pause()}>▶︎ / ⏸</button>
        <button onClick={() => v.current.currentTime += 1}>+1s</button><button onClick={() => v.current.currentTime += 5}>+5s</button>
        <select defaultValue="1" onChange={e => v.current.playbackRate = +e.target.value}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.5">1.5×</option></select>
      </div>
      <div className="steps">
        <div className="hint">1. Wie <kbd>W</kbd>/<kbd>T</kbd></div>
        <div className="row"><button className={pending.team === 'us' ? 'on' : ''} onClick={() => setPending(p => ({ ...p, team: 'us' }))}>{teamName}</button><button className={pending.team === 'them' ? 'on' : ''} onClick={() => setPending(p => ({ ...p, team: 'them' }))}>{match.opp}</button></div>
        <div className="hint">2. Actie</div>
        <div className="row">{ACTIONS.map(([a, k]) => <button key={a} className={pending.act === a ? 'on' : ''} onClick={() => setPending(p => ({ ...p, act: a }))}>{a} <kbd>{k}</kbd></button>)}</div>
        <div className="hint">3. Zone: tik op het veld (of <kbd>1</kbd>–<kbd>6</kbd>) · 4. Kwaliteit</div>
        <div className="row q">{QUALITIES.map(([q, t]) => <button key={q} title={t} onClick={() => tag(q)}>{q}</button>)}</div>
        <div className="hint">Volgende tag: {pending.team ? (pending.team === 'us' ? teamName : match.opp) : '…'} · {pending.act || '…'} · zone {pending.zone || '…'}{pending.lib ? ' · libero' : ''}</div>
      </div>
      <div className="row"><button className="us" onClick={() => point('us')}>Punt {teamName} <kbd>Q</kbd></button><button className="them" onClick={() => point('them')}>Punt {match.opp} <kbd>E</kbd></button><button onClick={undo}>↶ Ongedaan <kbd>Z</kbd></button></div>
      <div className="log">{ev.map(e => <div key={e.id} className={e.type === 'point' ? 'rally' : ''} onClick={() => { if (v.current) v.current.currentTime = Math.max(0, e.t - 2) }}>
        <span className="t">{fmtT(e.t)}</span>{log(e)}<button className="x" onClick={ev2 => { ev2.stopPropagation(); setScout(s => ({ ...s, events: s.events.filter(x => x.id !== e.id) })) }}>×</button></div>)}</div>
    </section>
    <section className="panel scout-right">
      <div className="state"><div><h2>{teamName}</h2><div className="score">{d.us}</div></div><div><h2>{match.opp}</h2><div className="score">{d.them}</div></div></div>
      <div className="row wrap"><label className="hint">Set <select value={set} onChange={e => setSet(+e.target.value)}>{match.sets.map((_, i) => <option key={i} value={i}>{i + 1}</option>)}</select></label>
        <label className="hint">Start opslag <select value={scout.serveFirst[set] || 'us'} onChange={e => setScout(s => ({ ...s, serveFirst: { ...s.serveFirst, [set]: e.target.value } }))}><option value="us">wij</option><option value="them">zij</option></select></label>
        <span className="hint">Opslag nu: {d.serve === 'us' ? teamName : match.opp}</span></div>
      <div className="row wrap"><button onClick={() => push({ type: 'adj', what: 'serve' })}>⇄ opslag</button><button onClick={() => push({ type: 'adj', what: 'rotUs' })}>↻ wij</button><button onClick={() => push({ type: 'adj', what: 'rotThem' })}>↻ zij</button><button onClick={sub}>Wissel…</button></div>
      <h2>{teamName} <span className="hint">rotatie {d.rotUs}</span></h2><Court team="us" />
      <label className="hint">Libero staat in voor <select value={libFor} onChange={e => setLibFor(e.target.value)}><option value="">niemand</option>{match.sets[set].pos.filter(Boolean).map(id => { const p = roster.find(x => x.id === id); return p && <option key={id} value={id}>{p.nr} {p.name}</option> })}</select></label>
      <h2>{match.opp} <span className="hint">{d.servers.length >= 6 ? 'rotatie bekend' : `${d.servers.length}/6 servers`}</span></h2><Court team="them" />
      <div className="hint">Bij hun opslag vraagt de app het rugnummer van de server; na 6 servers is hun rotatie bekend. <kbd>L</kbd> = libero-markering voor de volgende tag.</div>
    </section>
    {modal === 'stats' && <Modal onClose={() => setModal(null)}><h2>Statistieken</h2>
      {['us', 'them'].map(team => <div key={team}><h3>{team === 'us' ? teamName : match.opp}</h3>
        <table className="stats"><thead><tr><th>Speler</th><th>Rec</th><th>Rec+</th><th>RecF</th><th>Aanv</th><th>Kills</th><th>AanvF</th><th>Eff</th><th>Opsl</th><th>Aces</th><th>OpslF</th><th>Blok</th><th>Verd</th></tr></thead>
          <tbody>{statsRows(scout, team, roster).map(r => <tr key={r.nr}><td>{r.nr} {r.name}</td><td>{r.recN || ''}</td><td>{r.recPos}</td><td>{r.recErr || ''}</td><td>{r.attN || ''}</td><td>{r.kills || ''}</td><td>{r.attErr || ''}</td><td>{r.eff}</td><td>{r.srvN || ''}</td><td>{r.aces || ''}</td><td>{r.srvErr || ''}</td><td>{r.blk || ''}</td><td>{r.dig || ''}</td></tr>)}</tbody></table></div>)}
      <p className="hint">Rec+ = % receptie # of +. Eff = (kills − fouten) / aanvallen.</p><button className="ghost" onClick={() => setModal(null)}>Sluit</button></Modal>}
  </div>
}
