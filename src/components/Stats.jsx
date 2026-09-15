import Modal from './Modal.jsx'
import { stats, ROMAN } from '../lib/volley.js'
export default function Stats({ roster, matches, onClose }) {
  const rows = stats(roster, matches).sort((a, b) => (b.started + b.subbed + b.libero) - (a.started + a.subbed + a.libero))
  return <Modal onClose={onClose}><h2>Statistieken</h2>
    <p>{matches.length} bewaarde wedstrijd{matches.length === 1 ? '' : 'en'}. Sets gestart, ingevallen en als libero; daarna startposities.</p>
    <table className="stats"><thead><tr><th>Speler</th><th>Wed.</th><th>Start</th><th>In</th><th>Lib</th>{ROMAN.map(r => <th key={r}>{r}</th>)}</tr></thead>
      <tbody>{rows.map(r => <tr key={r.p.id}><td>{r.p.nr} {r.p.name}</td><td>{r.matches.size}</td><td>{r.started}</td><td>{r.subbed}</td><td>{r.libero}</td>{ROMAN.map(k => <td key={k}>{r.pos[k] || ''}</td>)}</tr>)}</tbody></table>
    <button className="ghost" onClick={onClose}>Sluit</button></Modal>
}
