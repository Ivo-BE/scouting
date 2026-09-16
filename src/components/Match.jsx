import { useState } from 'react'
import SetCard from './SetCard.jsx'
import { setWinner, matchState } from '../lib/volley.js'

export default function Match({ match, setMatch, roster, onSave, onNew, onReport, flash }) {
  const [active, setActive] = useState(0)
  const upd = (i, st) => setMatch({ ...match, sets: match.sets.map((s, j) => j === i ? st : s) })
  function next(i) {
    const n = match.sets[i + 1], cur = match.sets[i]
    const sets = match.sets.map((s, j) => j === i + 1 && !n.pos.some(Boolean) ? { ...s, pos: [...cur.pos], libero: cur.libero } : s)
    setMatch({ ...match, sets }); setActive(i + 1); document.getElementById('match')?.scrollIntoView({ behavior: 'smooth' })
  }
  const over = matchState(match).over
  function copySet1() {
    const s1 = match.sets[0]
    const targets = match.sets.map((s, j) => j).filter(j => j && !match.sets[j].locked && !match.sets[j].subs.length)
    if (!targets.length) { flash('Geen onbevestigde sets om naar te kopiëren'); return }
    const filled = targets.filter(j => match.sets[j].pos.some(Boolean))
    if (filled.length && !confirm(`Startopstelling van set 1 kopiëren naar set ${targets.map(j => j + 1).join(', ')}? Set ${filled.map(j => j + 1).join(', ')} ${filled.length === 1 ? 'heeft' : 'hebben'} al een opstelling; die wordt overschreven. Bevestigde sets blijven ongemoeid.`)) return
    setMatch({ ...match, sets: match.sets.map((s, j) => targets.includes(j) ? { ...s, pos: [...s1.pos], libero: s1.libero } : s) }); flash(`Set 1 gekopieerd naar set ${targets.map(j => j + 1).join(', ')}`)
  }
  const locked = !!match.locked
  return <section className="panel" id="match">
    {locked && <div className="lockbar">🔒 Wedstrijd afgesloten ({matchState(match).w}–{matchState(match).l}). Stand en opstellingen zijn vergrendeld.
      <button onClick={() => { if (confirm('Wedstrijd ontgrendelen om iets te corrigeren? Na opnieuw bewaren wordt ze weer vergrendeld.')) { setMatch({ ...match, locked: false }); flash('Ontgrendeld — vergeet niet opnieuw te bewaren') } }}>Ontgrendelen</button></div>}
    <fieldset disabled={locked} className="lockable">
    <div className="matchhead">
      <input id="opp" placeholder="Tegenstander" value={match.opp} onChange={e => setMatch({ ...match, opp: e.target.value })} />
      <input type="date" value={match.date} onChange={e => setMatch({ ...match, date: e.target.value })} />
      <div className="seg"><button className={match.home ? 'on' : ''} onClick={() => setMatch({ ...match, home: true })}>Thuis</button><button className={!match.home ? 'on' : ''} onClick={() => setMatch({ ...match, home: false })}>Uit</button></div>
    </div>
    <div className="tabs">{match.sets.map((st, i) => { const r = setWinner(st, i); return <button key={i} className={(i === active ? 'on ' : '') + (st.locked ? 'done ' : '') + (r || '')} onClick={() => setActive(i)}>Set {i + 1}{r ? (r === 'us' ? ' ✓' : ' ✗') : ''}</button> })}</div>
    <div className="sets">{match.sets.map((st, i) => <SetCard key={i} i={i} st={st} match={match} roster={roster} active={i === active} update={s => upd(i, s)} onNext={() => next(i)} flash={flash} />)}</div>
    </fieldset>
    <div className="actions">
      <button className="primary" onClick={onSave} disabled={locked}>{locked ? 'Bewaard 🔒' : 'Bewaar wedstrijd'}</button>
      <button onClick={onNew}>Nieuwe wedstrijd</button>
      <button onClick={copySet1} disabled={over || locked} title={over ? 'Wedstrijd is beslist' : 'Kopieert naar onbevestigde sets zonder wissels'}>Set 1 → open sets</button>
      <button onClick={onReport}>Verslag</button>
    </div>
  </section>
}
