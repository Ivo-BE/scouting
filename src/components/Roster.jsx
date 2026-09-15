import { useState } from 'react'
import * as db from '../lib/db.js'

export default function Roster({ teamId, roster, setRoster, onStats }) {
  const [nr, setNr] = useState(''); const [name, setName] = useState('')
  const sorted = [...roster].sort((a, b) => (+a.nr || 999) - (+b.nr || 999))
  async function add(e) {
    e?.preventDefault(); if (!name.trim()) return
    const p = await db.addPlayer(teamId, { nr: nr.trim(), name: name.trim(), lib: false, cap: false, set: false })
    setRoster([...roster, p]); setNr(''); setName('')
  }
  async function patch(p, changes) {
    const np = { ...p, ...changes }; setRoster(roster.map(x => x.id === p.id ? np : x)); await db.updatePlayer(teamId, np)
  }
  async function remove(p) {
    if (!confirm(`${p.name} verwijderen uit de ploeg? (Historie blijft bewaard)`)) return
    setRoster(roster.filter(x => x.id !== p.id)); await db.removePlayer(p.id)
  }
  return <section className="panel">
    <div className="head"><h2>Spelers</h2><button onClick={onStats}>Statistieken</button></div>
    <table className="roster"><tbody>
      {sorted.length === 0 && <tr><td className="empty">Nog geen spelers. Voeg hieronder je ploeg toe.</td></tr>}
      {sorted.map(p => <tr key={p.id}>
        <td><input className="nr" defaultValue={p.nr} inputMode="numeric" onBlur={e => e.target.value !== p.nr && patch(p, { nr: e.target.value.trim() })} /></td>
        <td><input className="nm" defaultValue={p.name} onBlur={e => e.target.value !== p.name && patch(p, { name: e.target.value.trim() })} /></td>
        <td><span className="tag">
          <label title="Libero"><input type="checkbox" checked={p.lib} onChange={e => patch(p, { lib: e.target.checked })} /><span>L</span></label>
          <label title="Kapitein"><input type="checkbox" checked={p.cap} onChange={e => patch(p, { cap: e.target.checked })} /><span>C</span></label>
          <label title="Setter (spelverdeler)"><input type="checkbox" checked={!!p.set} onChange={e => patch(p, { set: e.target.checked })} /><span>S</span></label></span></td>
        <td><button className="ghost" onClick={() => remove(p)}>×</button></td>
      </tr>)}
    </tbody></table>
    <form className="addrow" onSubmit={add}>
      <input className="nr" placeholder="Nr" inputMode="numeric" value={nr} onChange={e => setNr(e.target.value)} style={{ width: 56 }} />
      <input placeholder="Naam" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1 }} />
      <button className="primary">Voeg toe</button>
    </form>
  </section>
}
