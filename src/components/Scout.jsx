import { useEffect, useRef, useState } from 'react'
import { POS } from '../lib/volley.js'
import { ACTIONS, QUALITIES, D_TO_ZONE, SIMPLE_Q, Q_LABELS, ZONES_FOR, nextStep, serveStep, benchNext, benchStart, setterZone, distribution, derive, ourPlayerAt, oppPlayerAt, statsRows, rotationStats, scoutCsv, fixScout } from '../lib/scout.js'
import { reportHtml } from './ScoutReport.js'
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
  const [bench, setBench] = useState(false)          // bankmodus: live, grote knoppen, 3-traps kwaliteit
  const [askTo, setAskTo] = useState(null)            // na een aanval: waar kwam de bal neer? {eventId}
  const [askBlock, setAskBlock] = useState(null)      // aanval geblokt: door wie? {team: blokkende ploeg}
  const [smart, setSmart] = useState(true)            // slim taggen: volgende stap klaarzetten, punten automatisch
  const [tagPas, setTagPas] = useState(() => localStorage.getItem('scout:tagPas') === '1')
  const v = useRef(); const saveT = useRef()

  useEffect(() => { setScout(fixScout(match?.scout)); setSet(0) }, [matchId])
  const startStep = serve => bench ? benchStart(serve) : serveStep(serve)
  useEffect(() => { if (smart && match) setPending({ ...startStep(derive(match, fixScout(match.scout), set).serve), lib: false }) }, [matchId, set, smart, bench])
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
      const known = playerAt('them', 1)?.nr
      if (known) { commit(q, { nr: known, name: '' }); return }
      const nr = prompt(`Rugnummer van de server (${match.opp})`, ''); if (nr === null) return
      const nsv = sv.length < 6 && !sv.includes(nr) ? [...sv, nr] : sv
      setScout(s => ({ ...s, oppServers: { ...s.oppServers, [set]: nsv }, oppFirstRot: sv.length === 0 ? { ...s.oppFirstRot, [set]: d.rotThem } : s.oppFirstRot }))
      commit(q, { nr, name: '#' + nr }); return
    }
    commit(q, playerAt(p.team, p.zone))
  }
  function commit(q, pl) {
    const p = pending
    const id = uid()
    setScout(s => ({ ...s, events: [...s.events, { id, set, t: now(), type: 'touch', team: p.team, act: p.act, zone: p.zone, q, playerId: pl?.id || '', playerNr: pl?.nr || '', lib: !!pl?.lib, rotUs: d.rotUs, rotThem: d.rotThem, us: d.us, them: d.them }] }))
    const ev = { team: p.team, act: p.act, q }
    if (smart) {
      const n = bench ? benchNext(ev, { tagPas }) : nextStep(ev, { tagPas })
      if (n.point) { pointAfter(n.point, d); }
      else if (n.askBlock) { setAskBlock({ team: p.team === 'us' ? 'them' : 'us' }); setPending({ team: null, act: null, zone: null, lib: false }) }
      else if (n.pending && n.pending.act === null) setPending({ ...n.pending, lib: false })
      else if (n.pending) { const sz = n.pending.act === 'pas' ? setterZone(match, roster, scout, set, d) : null; setPending({ ...n.pending, zone: sz, lib: false }) }
      else setPending({ team: p.team, act: null, zone: null, lib: false })
    } else setPending({ team: p.team, act: null, zone: null, lib: false })
    if (p.act === 'aanval' && p.team === 'us' && !bench && q !== '=' && q !== '/') setAskTo(id)
  }
  function setTo(zone) { setScout(s => ({ ...s, events: s.events.map(e => e.id === askTo ? { ...e, to: zone } : e) })); setAskTo(null) }
  function openReport() { const win = window.open('', '_blank'); if (!win) { flash('Sta pop-ups toe voor het rapport'); return } win.document.write(reportHtml(match, scout, roster, teamName)); win.document.close() }
  function pointAfter(team, dd) {
    push({ type: 'point', team, us: dd.us + (team === 'us'), them: dd.them + (team === 'them') })
    const serveNext = dd.serve === team ? team : team   // winnaar serveert altijd
    setPending(smart ? { ...startStep(serveNext), lib: false } : { team: null, act: null, zone: null, lib: false })
    flash(`Punt ${team === 'us' ? teamName : match.opp}`)
  }
  function point(team) { pointAfter(team, d) }
  function fixScore() {
    const txt = prompt(`Juiste stand (wij-zij), nu ${d.us}-${d.them}:`, `${d.us}-${d.them}`); if (!txt) return
    const m = txt.match(/^\s*(\d+)\s*[-–: ]\s*(\d+)\s*$/); if (!m) { flash('Geef de stand als 12-10'); return }
    const du = +m[1] - d.us, dt = +m[2] - d.them; if (du < 0 || dt < 0) { flash('Terugtellen doe je met Ongedaan'); return }
    let dd = d; const add = []
    for (let i = 0; i < du; i++) add.push('us'); for (let i = 0; i < dt; i++) add.push('them')
    // wissel af zodat de opslagwissel realistisch blijft; daarna kun je met ⇄ opslag corrigeren
    add.sort(() => 0)
    let us = d.us, them = d.them
    setScout(s => ({ ...s, events: [...s.events, ...add.map(team => { if (team === 'us') us++; else them++; return { id: uid(), set, t: now(), type: 'point', team, us, them, gemist: true } })] }))
    setPending({ ...startStep(add.length ? add[add.length - 1] : d.serve), lib: false }); flash(`${add.length} gemiste punt${add.length === 1 ? '' : 'en'} toegevoegd — controleer wie serveert`)
  }
  function setOppLineup() {
    const cur = [1, 2, 3, 4, 5, 6].map(z => oppPlayerAt(scout, set, d, z)?.nr || '')
    const txt = prompt(`Rugnummers van ${match.opp} zoals ze NU staan, in de volgorde I II III IV V VI (zone 1 t/m 6), gescheiden door spaties:`, cur.join(' ').trim())
    if (txt === null) return
    const nrs = txt.trim().split(/\s+/).filter(Boolean); if (nrs.length !== 6) { flash('Geef precies zes nummers'); return }
    setScout(s => ({ ...s, oppServers: { ...s.oppServers, [set]: nrs }, oppFirstRot: { ...s.oppFirstRot, [set]: d.rotThem } })); flash('Rotatie ' + match.opp + ' ingesteld')
  }
  function blockBy(zone) {
    const t = askBlock.team; const pl = zone ? playerAt(t, zone) : null
    if (pl) push({ type: 'touch', team: t, act: 'blok', zone, q: '#', playerId: pl.id || '', playerNr: pl.nr || '', lib: false, rotUs: d.rotUs, rotThem: d.rotThem, us: d.us, them: d.them })
    setAskBlock(null); pointAfter(t, d)
  }
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
      if (askBlock) { if ('234'.includes(e.key) && e.key) blockBy(+e.key); else blockBy(null); return }
      if (askTo) { if ('123456'.includes(e.key) && e.key) { setTo(+e.key); return } setAskTo(null); if (e.key === 'Escape') return }
      const k = e.key.toLowerCase(); const vid = v.current
      if (e.key === ' ') { e.preventDefault(); vid?.paused ? vid?.play() : vid?.pause(); return }
      if (e.key === 'ArrowLeft') { if (vid) vid.currentTime -= 5; return } if (e.key === 'ArrowRight') { if (vid) vid.currentTime += 5; return }
      if (k === 'w') setPending(p => ({ ...p, team: 'us' })); else if (k === 't') setPending(p => ({ ...p, team: 'them' }))
      else if (ACTIONS.some(a => a[1].toLowerCase() === k)) { const act = ACTIONS.find(a => a[1].toLowerCase() === k)[0]; setPending(p => ({ ...p, act, zone: act === 'opslag' ? 1 : p.zone })) }
      else if ('123456'.includes(e.key) && e.key) setPending(p => ({ ...p, zone: +e.key }))
      else if (QUALITIES.some(q => q[0] === e.key)) tag(e.key)
      else if (k === 'q') point('us'); else if (k === 'e') point('them'); else if (k === 'z') undo(); else if (k === 'l') setPending(p => ({ ...p, lib: !p.lib }))
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })

  const rally = (() => { const ev = scout.events.filter(e => e.set === set); let i = ev.length; while (i > 0 && ev[i - 1].type !== 'point') i--; return ev.slice(i).filter(e => e.type === 'touch') })()
  const ABBR = { opslag: 'S', receptie: 'R', pas: 'P', aanval: 'A', blok: 'B', verdediging: 'V' }
  const QCLS = q => q === '#' ? 'q-good' : (q === '=' || q === '/' || q === '-') ? 'q-bad' : 'q-mid'
  const ballTeam = pending.team || (rally.length ? (rally[rally.length - 1].team) : d.serve)
  const RallyStrip = () => <div className="rally">
    <div className="lanes">
      {['us', 'them'].map(t => <div key={t} className="lane"><span className="lbl">{t === 'us' ? teamName : match.opp}</span>
        <div className="chips">{rally.map((e, i) => <button key={e.id} className={'chip ' + QCLS(e.q) + (e.team === t ? '' : ' ghostchip')} style={{ gridColumn: i + 1 }} title={e.team === t ? `${e.act} z${e.zone} ${e.q} · #${e.playerNr} — tik om te schrappen` : ''}
          onClick={() => { if (e.team === t) setScout(s => ({ ...s, events: s.events.filter(x => x.id !== e.id) })) }}>{e.team === t ? <><b>{ABBR[e.act]}</b>{e.playerNr || '?'}<i>{e.q}</i></> : ''}</button>)}
          {pending.act && <span className={'chip next' + (ballTeam === t ? '' : ' ghostchip')} style={{ gridColumn: rally.length + 1 }}>{ballTeam === t ? <><b>{ABBR[pending.act]}</b>…</> : ''}</span>}
        </div></div>)}
    </div>
    <div className="hint">{rally.length ? `Rally: ${rally.length} acties · bal bij ${ballTeam === 'us' ? teamName : match.opp}` : `Nieuwe rally · opslag ${d.serve === 'us' ? teamName : match.opp}`}{rally.length ? ' · tik een blokje om het te schrappen' : ''}</div>
  </div>
  const Court = ({ team }) => <div className="court"><div className="floor">{POS.map((p, dd) => { const z = D_TO_ZONE[dd]; const pl = playerAt(team, z)
    return <div key={dd} className={'pos scell' + (pending.zone === z && pending.team === team ? ' sel' : '') + (pl?.lib ? ' lib' : '')} onClick={() => setPending(pp => ({ ...pp, team, zone: z }))}><small>{p[0]} · z{z}</small><b>{pl ? (pl.nr || pl.name) : '?'}</b></div> })}</div></div>
  const ev = scout.events.filter(e => e.set === set).slice(-80).reverse()
  const log = e => e.type === 'point' ? `Punt ${e.team === 'us' ? teamName : match.opp} → ${e.us}-${e.them}` : e.type === 'adj' ? `Aanpassing: ${e.what}` : `${e.team === 'us' ? teamName : match.opp} · ${e.act} z${e.zone} ${e.q} · #${e.playerNr || '?'}${e.lib ? ' (L)' : ''}`

  return <div className={'scout' + (bench ? ' bench' : '')}>
    <section className="panel scout-left">
      <div className="row wrap">
        <select value={matchId} onChange={e => setMatchId(e.target.value)}>{matches.map(m => <option key={m.id} value={m.id}>{m.date} · {m.opp}</option>)}</select>
        <label className="filebtn"><input type="file" accept="video/*" hidden onChange={e => { const f = e.target.files[0]; if (f) { v.current.src = URL.createObjectURL(f); setVideoName(f.name) } }} />{videoName || 'Video kiezen…'}</label>
        <button onClick={() => setModal('stats')}>Statistieken</button>
        <button onClick={openReport}>Rapport (PDF)</button>
        <button className={bench ? 'on' : ''} onClick={() => setBench(b => !b)} title="Live op de bank: geen video, grote knoppen, 3 niveaus">Bankmodus</button>
        <button className={smart ? 'on' : ''} onClick={() => setSmart(v => !v)} title="Zet na elke tag de logische volgende stap klaar en kent punten automatisch toe">Slim</button>
        <button className={tagPas ? 'on' : ''} onClick={() => setTagPas(v => { localStorage.setItem('scout:tagPas', v ? '' : '1'); return !v })} title="Na elke receptie/verdediging de pas klaarzetten, met de setter al ingevuld">Pas taggen</button>
        <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([scoutCsv(scout, teamName, match.opp)], { type: 'text/csv;charset=utf-8' })); a.download = `scout-${match.opp}.csv`; a.click() }}>CSV</button>
      </div>
      <video ref={v} controls playsInline style={{ display: bench ? 'none' : '' }} />
      {bench ? <div className="benchhead">
        <div className="bscore"><span className="bteam">{teamName}</span><b onClick={fixScore} title="Tik om de stand te corrigeren">{d.us}</b><span className="bsep">–</span><b onClick={fixScore} title="Tik om de stand te corrigeren">{d.them}</b><span className="bteam">{match.opp}</span></div>
        <div className="bmeta">Set {set + 1} · opslag <b>{d.serve === 'us' ? teamName : match.opp}</b> · rotatie {d.rotUs}</div>
        <div className="benchhint">{pending.act === 'opslag' ? `${teamName} serveert — tik de kwaliteit van de opslag` : pending.act === 'receptie' ? `${match.opp} serveert — wie ving op?` : pending.act === 'aanval' ? 'Wie viel aan, en hoe?' : pending.act === 'pas' ? 'Pas — tik de kwaliteit' : 'Rally loopt — tik wat je ziet van ' + teamName + ', of het punt'}</div>
        <div className="hint">Iets gemist? Tik gewoon de volgende actie die je wél zag, of alleen het punt. Stand fout? Tik op de stand.</div>
      </div> : <div className="row">
        <button onClick={() => v.current.currentTime -= 5}>−5s</button><button onClick={() => v.current.currentTime -= 1}>−1s</button>
        <button onClick={() => v.current.paused ? v.current.play() : v.current.pause()}>▶︎ / ⏸</button>
        <button onClick={() => v.current.currentTime += 1}>+1s</button><button onClick={() => v.current.currentTime += 5}>+5s</button>
        <select defaultValue="1" onChange={e => v.current.playbackRate = +e.target.value}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.5">1.5×</option></select>
      </div>}
      {d.servers.length < 6 && !bench && <div className="banner">Rugnummers van {match.opp} nog niet (volledig) bekend voor set {set + 1}. <button onClick={setOppLineup}>Invullen…</button> <span className="hint">of laat de app ze leren bij hun opslag</span></div>}
      <RallyStrip />
      <div className="steps">
        {!bench && <><div className="hint">1. Wie <kbd>W</kbd>/<kbd>T</kbd></div>
        <div className="row"><button className={pending.team === 'us' ? 'on' : ''} onClick={() => setPending(p => ({ ...p, team: 'us' }))}>{teamName}</button><button className={pending.team === 'them' ? 'on' : ''} onClick={() => setPending(p => ({ ...p, team: 'them' }))}>{match.opp}</button></div></>}
        <div className={'step' + (pending.team ? '' : ' inactive')}><div className="hint">{bench ? 'Actie' : '2. Actie'}</div>
        <div className="row">{ACTIONS.filter(([a]) => !bench || a !== 'pas' || tagPas).map(([a, k]) => <button key={a} className={pending.act === a ? 'on' : ''} onClick={() => setPending(p => ({ ...p, act: a, zone: a === 'opslag' ? 1 : p.zone }))}>{a} {!bench && <kbd>{k}</kbd>}</button>)}</div>
        </div><div className={'step' + (pending.act ? '' : ' inactive')}><div className="hint">{bench ? 'Speler' : '3. Speler / zone'} {pending.act === 'opslag' ? '(opslag is altijd zone 1)' : <>(of <kbd>1</kbd>–<kbd>6</kbd>)</>}</div>
        <div className="minicourt">{POS.map((p, dd) => { const z = D_TO_ZONE[dd]; const team = pending.team || 'us'; const pl = playerAt(team, z); const ok = !pending.act || !ZONES_FOR[pending.act] || ZONES_FOR[pending.act].includes(z)
          return <button key={dd} className={(pending.zone === z ? 'on' : '') + (pl?.lib ? ' lib' : '') + (ok ? '' : ' dim')} title={ok ? '' : 'Ongebruikelijk voor deze actie, maar mogelijk'} onClick={() => setPending(pp => ({ ...pp, team, zone: z }))}><small>z{z} · {p[0]}</small><b>{pl ? (pl.nr ? pl.nr + ' ' : '') + (pl.name || '') : '?'}</b></button> })}</div>
        </div><div className={'step' + (pending.act && pending.zone ? '' : ' inactive')}><div className="hint">{bench ? 'Hoe ging het?' : '4. Kwaliteit'} <button className="ghost qhelp" onClick={() => setModal('qhelp')}>?</button></div>
        <div className="row q">{bench && SIMPLE_Q[pending.act] ? SIMPLE_Q[pending.act].map(([lbl, q]) => <button key={q} onClick={() => tag(q)}>{lbl}</button>)
          : QUALITIES.map(([q, t]) => { const lbl = pending.act ? Q_LABELS[pending.act][q] : t; if (pending.act && lbl === null) return null
            return <button key={q} title={t} onClick={() => tag(q)}><span className="sym">{q}</span><small>{lbl}</small></button> })}</div></div>
        <div className="hint">{smart && pending.act ? 'Klaargezet: ' : 'Volgende tag: '}{pending.team ? (pending.team === 'us' ? teamName : match.opp) : '…'} · {pending.act || '…'} · zone {pending.zone || '…'}{pending.lib ? ' · libero' : ''}{smart && (pending.act === 'opslag' || pending.act === 'pas') && pending.zone ? ' — tik alleen de kwaliteit' : ''}</div>
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
      <div className="row"><button onClick={setOppLineup}>Rugnummers {match.opp}…</button></div>
      <div className="hint">Vul hun zes nummers in zoals ze staan (I t/m VI), of laat de app ze leren: bij een onbekende server vraagt hij het nummer. <kbd>L</kbd> = libero-markering voor de volgende tag.</div>
    </section>
    {askBlock && <Modal onClose={() => blockBy(null)}><h2>Geblokt — door wie?</h2><p>Netspelers van {askBlock.team === 'us' ? teamName : match.opp}. Het punt gaat naar hen.</p>
      <div className="choices">{[4, 3, 2].map(z => { const pl = playerAt(askBlock.team, z); return <button key={z} onClick={() => blockBy(z)}>z{z} · {pl ? (pl.nr + ' ' + (pl.name || '')) : '?'}</button> })}</div>
      <button className="ghost" onClick={() => blockBy(null)}>Weet ik niet — alleen het punt</button></Modal>}
    {askTo && <Modal onClose={() => setAskTo(null)}><h2>Waar kwam de bal neer?</h2><p>Tik de zone bij {match.opp} (gezien vanaf hun kant), of sla over.</p>
      <div className="court"><div className="floor">{[[2, 3, 4], [1, 6, 5]].map((row, ri) => row.map(z => <div key={z} className="pos scell" style={{ order: ri * 3 }} onClick={() => setTo(z)}><small>zone</small><b>{z}</b></div>))}</div></div>
      <button className="ghost" onClick={() => setAskTo(null)}>Sla over</button></Modal>}
    {modal === 'qhelp' && <Modal onClose={() => setModal(null)}><h2>Kwaliteitscodes</h2>
      <p>Dit zijn de standaardcodes uit Data Volley, zodat je cijfers vergelijkbaar zijn met andere scoutingprogramma's. De betekenis verschilt licht per actie:</p>
      <table className="stats"><thead><tr><th>Code</th>{ACTIONS.map(([a]) => <th key={a}>{a}</th>)}</tr></thead>
        <tbody>{QUALITIES.map(([q]) => <tr key={q}><td><b>{q}</b></td>{ACTIONS.map(([a]) => <td key={a} style={{ textAlign: 'left' }}>{Q_LABELS[a][q] ?? '–'}</td>)}</tr>)}</tbody></table>
      <p className="hint">Vuistregel receptie: kan de setter een snelle bal geven → #; alleen een hoge bal → +; moet de setter de bal redden → ! of −. Wees vooral consequent.</p>
      <button className="ghost" onClick={() => setModal(null)}>Sluit</button></Modal>}
    {modal === 'stats' && <Modal onClose={() => setModal(null)}><h2>Statistieken</h2>
      <h3>Side-out per rotatie</h3><table className="stats"><thead><tr><th>Rot</th><th>Server</th><th>Ontv</th><th>SO</th><th>SO%</th><th>Serv</th><th>Break</th><th>Br%</th></tr></thead>
        <tbody>{rotationStats(match, scout, roster).map(r => <tr key={r.rot}><td>R{r.rot + 1}</td><td>{r.server}</td><td>{r.recv}</td><td>{r.so}</td><td>{r.soPct ?? ''}{r.soPct != null ? '%' : ''}</td><td>{r.serve}</td><td>{r.brk}</td><td>{r.brkPct ?? ''}{r.brkPct != null ? '%' : ''}</td></tr>)}</tbody></table>
      <h3>Spelverdeling {teamName} per rotatie</h3><table className="stats"><thead><tr><th>Rot</th><th>Aanv</th><th>z4</th><th>z3</th><th>z2</th><th>achter</th><th>na goede bal → z4/z3/z2</th><th>na slechte bal → z4/z3/z2</th><th>Pas</th></tr></thead>
        <tbody>{distribution(scout).map(r => { const pc = (n, t) => t ? Math.round(100 * n / t) + '%' : '–'; const back = r.zones[1] + r.zones[5] + r.zones[6]
          return <tr key={r.rot}><td>R{r.rot + 1}</td><td>{r.total || ''}</td><td>{pc(r.zones[4], r.total)}</td><td>{pc(r.zones[3], r.total)}</td><td>{pc(r.zones[2], r.total)}</td><td>{pc(back, r.total)}</td>
            <td>{r.goodN ? `${pc(r.good[4], r.goodN)} / ${pc(r.good[3], r.goodN)} / ${pc(r.good[2], r.goodN)}` : '–'}</td><td>{r.badN ? `${pc(r.bad[4], r.badN)} / ${pc(r.bad[3], r.badN)} / ${pc(r.bad[2], r.badN)}` : '–'}</td>
            <td>{r.pas.length ? `${r.pas.length} · ${Math.round(100 * r.pas.filter(q => q === '#' || q === '+').length / r.pas.length)}% goed` : ''}</td></tr> })}</tbody></table>
      {['us', 'them'].map(team => <div key={team}><h3>{team === 'us' ? teamName : match.opp}</h3>
        <table className="stats"><thead><tr><th>Speler</th><th>Rec</th><th>Rec+</th><th>RecF</th><th>Aanv</th><th>Kills</th><th>AanvF</th><th>Eff</th><th>Opsl</th><th>Aces</th><th>OpslF</th><th>Blok</th><th>Verd</th></tr></thead>
          <tbody>{statsRows(scout, team, roster).map(r => <tr key={r.nr}><td>{r.nr} {r.name}</td><td>{r.recN || ''}</td><td>{r.recPos}</td><td>{r.recErr || ''}</td><td>{r.attN || ''}</td><td>{r.kills || ''}</td><td>{r.attErr || ''}</td><td>{r.eff}</td><td>{r.srvN || ''}</td><td>{r.aces || ''}</td><td>{r.srvErr || ''}</td><td>{r.blk || ''}</td><td>{r.dig || ''}</td></tr>)}</tbody></table></div>)}
      <p className="hint">Rec+ = % receptie # of +. Eff = (kills − fouten) / aanvallen.</p><button className="ghost" onClick={() => setModal(null)}>Sluit</button></Modal>}
  </div>
}
