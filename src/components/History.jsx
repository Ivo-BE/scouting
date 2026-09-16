import { fmt, matchState } from '../lib/volley.js'
export default function History({ matches, currentId, onOpen, onReport, onCopy, onDelete }) {
  return <section className="panel"><h2>Historie</h2><ul className="hist">
    {!matches.length && <li className="empty">Bewaarde wedstrijden verschijnen hier.</li>}
    {matches.map(m => { const sets = m.sets.filter(s => s.us !== '' || s.them !== ''), ms = matchState(m); return <li key={m.id} className={m.id === currentId ? 'cur' : ''}>
      <div className="h1"><span className="d">{fmt(m.date)}</span><span className="o">{m.opp} <span>{m.home ? 'thuis' : 'uit'}</span></span>{ms.over && <span className={'res ' + (ms.w > ms.l ? 'us' : 'them')}>{ms.w > ms.l ? 'W' : 'V'}</span>}{m.locked && <span className="lock" title="Vergrendeld">🔒</span>}</div>
      <div className="h2"><span className="r">{sets.length ? <><b>{ms.w}–{ms.l}</b> · {sets.map(s => `${s.us}-${s.them}`).join(', ')}</> : 'geen uitslag'}</span>
        <span className="acts"><button className="ghost" onClick={() => onOpen(m)} title="Openen">Open</button><button className="ghost" onClick={() => onReport(m)} title="Verslag">Verslag</button><button className="ghost" onClick={() => onCopy(m)} title="Opstelling overnemen in nieuwe wedstrijd">Kopie</button><button className="ghost del" onClick={() => onDelete(m)} title="Verwijderen">×</button></span></div>
    </li> })}
  </ul></section>
}
