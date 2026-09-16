import { useState } from 'react'
import { POS, lineup, allowedSubs, baseIndex, dispIndex, score, setWinner, matchState, snap, undo } from '../lib/volley.js'
import Modal from './Modal.jsx'
import { ROLES, SYSTEMS } from '../lib/scout.js'

const label = p => p ? `${p.nr ? p.nr + ' ' : ''}${p.name}` : '–'

export default function SetCard({ i, st, match, roster, active, update, onNext, flash }) {
  const [subK, setSubK] = useState(null)
  const [rolesOpen, setRolesOpen] = useState(() => localStorage.getItem('rolesOpen') === '1')
  const player = id => roster.find(p => p.id === id)
  const l = lineup(st), used = st.pos.filter(Boolean), full = used.length === 6 && new Set(used).size === 6
  const act = (what, fn) => update(fn(snap(st, what)))
  const winner = setWinner(st, i), ms = matchState(match)
  const bench = (() => { const on = new Set([...l, st.libero].filter(Boolean)); return roster.filter(p => !on.has(p.id)).map(p => p.nr || p.name.split(' ')[0]) })()
  const dup = used.some((x, idx, a) => a.indexOf(x) !== idx)

  const Score = ({ f, ph }) => <span className="sc">
    <button onClick={() => act('punt ' + (f === 'us' ? 'wij' : 'zij'), s => ({ ...s, [f]: String(Math.max(0, (+s[f] || 0) - 1)) }))}>−</button>
    <input value={st[f]} placeholder={ph} inputMode="numeric" onChange={e => update({ ...st, [f]: e.target.value.replace(/\D/g, '') })} />
    <button disabled={!!winner} title={winner ? 'Set is beslist' : ''} onClick={() => act('punt ' + (f === 'us' ? 'wij' : 'zij'), s => ({ ...s, [f]: String((+s[f] || 0) + 1) }))}>+</button></span>

  return <div className={'set' + (active ? ' active' : '')}>
    <div className="top"><h2>Set {i + 1}</h2><span className="scorebox"><Score f="us" ph="wij" /><span className="sep">–</span><Score f="them" ph="zij" /></span></div>
    <div className="court"><div className="net" /><div className="floor">
      {POS.map((p, d) => {
        if (!st.locked) return <div key={d} className={'pos' + (st.pos[d] && used.filter(x => x === st.pos[d]).length > 1 ? ' dup' : '')}><small>{p[0]}</small>
          <select title={p[1]} value={st.pos[d]} onChange={e => { const pos = [...st.pos]; pos[d] = e.target.value; update({ ...st, pos }) }}>
            <option value="">–</option>{roster.map(r => <option key={r.id} value={r.id}>{label(r)}</option>)}</select></div>
        const k = baseIndex(st, d), pl = player(l[k]), can = allowedSubs(st, k, roster).length > 0
        return <div key={d} className={'pos live' + (d === 5 ? ' serve' : '')}><small>{p[0]}</small>
          <button disabled={!can} onClick={() => setSubK(k)}>{label(pl)}{l[k] !== st.pos[k] && <i>in</i>}</button></div>
      })}
    </div></div>
    <div className="toolrow">
      {st.locked ? <>
        <button onClick={() => act('rotatie', s => ({ ...s, rot: (s.rot + 1) % 6 }))}>↻ Draai door</button>
        <button disabled={!st.rot} title="Rotatie terug" onClick={() => act('rotatie terug', s => ({ ...s, rot: (s.rot + 5) % 6 }))}>↺</button>
        <button disabled={st.timeouts.length >= 2} onClick={() => { act('time-out', s => ({ ...s, timeouts: [...s.timeouts, score(s)] })); flash('Time-out bij ' + score(st)) }}>Time-out {st.timeouts.length}/2</button>
        <button disabled={!st.hist.length} onClick={() => { const r = undo(st); update(r.st); flash('Ongedaan: ' + r.what) }}>↶ Ongedaan{st.hist.length ? ` (${st.hist[st.hist.length - 1].what})` : ''}</button>
        {!st.subs.length && <button className="ghost" onClick={() => update({ ...st, locked: false, rot: 0, timeouts: [], hist: [] })}>Opstelling aanpassen</button>}
      </> : <>
        <button className="primary" disabled={!full} onClick={() => update({ ...st, locked: true })}>Opstelling bevestigen</button>
        {!full && <span className="hint">Vul eerst alle zes posities in</span>}
        {used.length > 0 && <button className="ghost" onClick={() => { if (confirm(`Voorbereide opstelling van set ${i + 1} wissen?`)) update({ ...st, pos: ['', '', '', '', '', ''], libero: '', us: '', them: '', notes: '' }) }}>Wis set</button>}
        <span className="hint">Niet bevestigd = telt niet mee in statistieken en verslag</span>
      </>}
    </div>
    {winner && <div className={'setdone ' + winner}>Set {winner === 'us' ? 'gewonnen' : 'verloren'} {st.us || 0}-{st.them || 0} · stand in sets {ms.w}–{ms.l}
      {ms.over ? <> · <b>wedstrijd {ms.w > ms.l ? 'gewonnen' : 'verloren'}</b></> : i < 4 && <button onClick={onNext}>Naar set {i + 2} →</button>}</div>}
    {st.locked && <div className="hint" style={{ marginTop: 6 }}>Rotatie {st.rot} · tik op een speler om te wisselen ({st.subs.length}/6){st.timeouts.length ? ' · TO bij ' + st.timeouts.join(', ') : ''}</div>}
    {full && <details className="extra rolesbox" open={rolesOpen} onToggle={e => { setRolesOpen(e.target.open); localStorage.setItem('rolesOpen', e.target.open ? '1' : '') }}>
      <summary>Rollen en systeem deze set <span className="hint">{st.system ? '· ' + st.system : ''}{Object.values(st.roles || {}).filter(Boolean).length ? ` · ${Object.values(st.roles || {}).filter(Boolean).length} aangepast` : ''}</span></summary>
      <div><label className="hint">Basis uit de spelerslijst; hier aanpassen als iemand deze set anders speelt</label>
        <div className="roles">{st.pos.map(id => { const p = player(id); if (!p) return null; const v = st.roles?.[id] ?? ''
          return <label key={id} className="rolesel"><span>{p.nr} {p.name}</span><select value={v} onChange={e => update({ ...st, roles: { ...(st.roles || {}), [id]: e.target.value || undefined } })}>
            <option value="">{ROLES[p.role] || 'rol?'}</option>{Object.entries(ROLES).filter(([k]) => k !== 'L').map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label> })}</div></div>
      <div><label>Systeem</label><select value={st.system || ''} onChange={e => update({ ...st, system: e.target.value || undefined })}><option value="">{i ? 'zoals vorige set' : '1-5 (standaard)'}</option>{Object.entries(SYSTEMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
    </details>}
    <div className="extra">
      <div><label>Libero</label><select value={st.libero} onChange={e => update({ ...st, libero: e.target.value })}>
        <option value="">–</option>{roster.filter(p => p.lib || p.id === st.libero).map(p => <option key={p.id} value={p.id}>{label(p)}</option>)}</select></div>
      <div><label>Wissels</label><div className="sublog">{st.subs.length ? st.subs.map(w => `${(player(w.out) || {}).nr || '?'} → ${(player(w.in) || {}).nr || '?'}${w.score ? ' (' + w.score + ')' : ''}`).join(', ') : <span className="hint">nog geen</span>}</div></div>
      <div><label>Notities</label><input value={st.notes} placeholder="bv. blessure 12 bij 20-23" onChange={e => update({ ...st, notes: e.target.value })} /></div>
    </div>
    <div className="bench">{dup && <span className="warn">Zelfde speler staat twee keer op het veld. </span>}{bench.length ? <>Bank: <b>{bench.join(', ')}</b></> : 'Iedereen staat op het veld.'}</div>

    {subK !== null && (() => {
      const out = player(l[subK]), opts = allowedSubs(st, subK, roster); let sc = score(st)
      return <Modal onClose={() => setSubK(null)}>
        <h2>Wissel op {POS[dispIndex(st, subK)][0]}</h2>
        <p>{label(out)} gaat eruit. {opts.length ? 'Wie komt erin?' : 'Geen toegestane wissel.'}</p>
        <div className="choices">{opts.map(p => <button key={p.id} onClick={() => {
          act('wissel', s => ({ ...s, subs: [...s.subs, { k: subK, out: out.id, in: p.id, score: sc }] })); setSubK(null); flash('Wissel vastgelegd')
        }}>{label(p)}</button>)}</div>
        <label>Stand bij wissel <input defaultValue={sc} inputMode="numeric" onChange={e => { sc = e.target.value.trim() }} /></label>
        <button className="ghost" onClick={() => setSubK(null)}>Annuleer</button>
      </Modal>
    })()}
  </div>
}
