import { useState } from 'react'
import SetCard from './SetCard.jsx'
import { setWinner } from '../lib/volley.js'

export default function Match({ match, setMatch, roster, onSave, onNew, onReport, flash }) {
  const [active, setActive] = useState(0)
  const upd = (i, st) => setMatch({ ...match, sets: match.sets.map((s, j) => j === i ? st : s) })
  function next(i) {
    const n = match.sets[i + 1], cur = match.sets[i]
    const sets = match.sets.map((s, j) => j === i + 1 && !n.pos.some(Boolean) ? { ...s, pos: [...cur.pos], libero: cur.libero } : s)
    setMatch({ ...match, sets }); setActive(i + 1); document.getElementById('match')?.scrollIntoView({ behavior: 'smooth' })
  }
  function copySet1() {
    const s1 = match.sets[0]
    setMatch({ ...match, sets: match.sets.map((s, j) => j && !s.subs.length ? { ...s, pos: [...s1.pos], libero: s1.libero } : s) }); flash('Set 1 gekopieerd naar set 2–5')
  }
  return <section className="panel" id="match">
    <div className="matchhead">
      <input id="opp" placeholder="Tegenstander" value={match.opp} onChange={e => setMatch({ ...match, opp: e.target.value })} />
      <input type="date" value={match.date} onChange={e => setMatch({ ...match, date: e.target.value })} />
      <div className="seg"><button className={match.home ? 'on' : ''} onClick={() => setMatch({ ...match, home: true })}>Thuis</button><button className={!match.home ? 'on' : ''} onClick={() => setMatch({ ...match, home: false })}>Uit</button></div>
    </div>
    <div className="tabs">{match.sets.map((st, i) => { const r = setWinner(st, i); return <button key={i} className={(i === active ? 'on ' : '') + (st.locked ? 'done ' : '') + (r || '')} onClick={() => setActive(i)}>Set {i + 1}{r ? (r === 'us' ? ' ✓' : ' ✗') : ''}</button> })}</div>
    <div className="sets">{match.sets.map((st, i) => <SetCard key={i} i={i} st={st} match={match} roster={roster} active={i === active} update={s => upd(i, s)} onNext={() => next(i)} flash={flash} />)}</div>
    <div className="actions">
      <button className="primary" onClick={onSave}>Bewaar wedstrijd</button>
      <button onClick={onNew}>Nieuwe wedstrijd</button>
      <button onClick={copySet1}>Set 1 → alle sets</button>
      <button onClick={onReport}>Verslag</button>
    </div>
  </section>
}
