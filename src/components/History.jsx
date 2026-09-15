import { fmt, matchState } from '../lib/volley.js'
export default function History({ matches, currentId, onOpen, onReport, onCopy, onDelete }) {
  return <section className="panel"><h2>Historie</h2><ul className="hist">
    {!matches.length && <li className="empty">Bewaarde wedstrijden verschijnen hier.</li>}
    {matches.map(m => { const sets = m.sets.filter(s => s.us !== '' || s.them !== ''), ms = matchState(m); return <li key={m.id} className={m.id === currentId ? 'cur' : ''}>
      <span className="d">{fmt(m.date)}</span>
      <span><div className="o">{m.opp} <span>{m.home ? 'thuis' : 'uit'}</span>{ms.over && <span className={'res ' + (ms.w > ms.l ? 'us' : 'them')}>{ms.w > ms.l ? 'W' : 'V'}</span>}</div>
        <div className="r">{sets.length ? `${ms.w}–${ms.l} · ` + sets.map(s => `${s.us}-${s.them}`).join(', ') : 'geen uitslag'}</div></span>
      <span><button className="ghost" onClick={() => onOpen(m)}>Open</button><button className="ghost" onClick={() => onReport(m)}>Verslag</button><button className="ghost" onClick={() => onCopy(m)}>Kopie</button><button className="ghost" onClick={() => onDelete(m)}>×</button></span>
    </li> })}
  </ul></section>
}
