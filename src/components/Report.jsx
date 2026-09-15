import Modal from './Modal.jsx'
import { reportLines, matchState, POS, playedSet } from '../lib/volley.js'

export default function Report({ match, roster, teamName, onClose, flash }) {
  const txt = reportLines(match, roster, teamName).join('\n')
  async function copy() { try { await navigator.clipboard.writeText(txt); flash('Verslag gekopieerd') } catch { alert('Kopiëren lukte niet; selecteer de tekst handmatig.') } onClose() }
  function print() {
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    const nm = id => { const p = roster.find(x => x.id === id); return p ? `${p.nr ? p.nr + ' ' : ''}${p.name}` : '–' }
    const sets = match.sets.filter(playedSet); const { w, l } = matchState(match)
    const court = st => `<table class="c"><tr>${[0, 1, 2].map(d => `<td><small>${POS[d][0]}</small>${esc(nm(st.pos[d]))}</td>`).join('')}</tr><tr>${[3, 4, 5].map(d => `<td><small>${POS[d][0]}</small>${esc(nm(st.pos[d]))}</td>`).join('')}</tr></table>`
    const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Verslag ${esc(match.opp)}</title><style>
      body{font:12px/1.4 Helvetica,Arial,sans-serif;color:#111;margin:18mm 16mm}h1{font-size:20px;margin:0 0 2px}h2{font-size:14px;margin:14px 0 4px;border-bottom:1px solid #999;padding-bottom:2px}
      .sub{color:#555;margin-bottom:10px}.c{border-collapse:collapse;margin:6px 0}.c td{border:1px solid #333;width:38mm;height:11mm;text-align:center;font-weight:600;position:relative}
      .c td small{position:absolute;left:3px;top:2px;font-weight:400;color:#666}.c tr:first-child td{border-top:3px solid #000}dl{margin:4px 0;display:grid;grid-template-columns:70px 1fr;gap:2px 8px}dt{color:#555}dd{margin:0}
      @media print{@page{margin:12mm}body{margin:0}}</style></head><body>
      <h1>${esc(teamName || 'Ploeg')} – ${esc(match.opp)}</h1><div class="sub">${match.home ? 'Thuis' : 'Uit'} · ${match.date}${sets.some(st => st.us !== '') ? ` · Uitslag ${w}–${l} (${sets.map(st => `${st.us || '?'}-${st.them || '?'}`).join(', ')})` : ''}</div>
      ${sets.map((st, i) => `<h2>Set ${i + 1}${st.us !== '' || st.them !== '' ? ` — ${st.us}-${st.them}` : ''}</h2>${court(st)}<dl>
        ${st.libero ? `<dt>Libero</dt><dd>${esc(nm(st.libero))}</dd>` : ''}
        <dt>Wissels</dt><dd>${st.subs.length ? st.subs.map(x => `${esc(nm(x.out))} uit, ${esc(nm(x.in))} in${x.score ? ' bij ' + esc(x.score) : ''}`).join('<br>') : '–'}</dd>
        <dt>Time-outs</dt><dd>${st.timeouts.length ? st.timeouts.join(', ') : '–'}</dd>
        ${st.notes ? `<dt>Notities</dt><dd>${esc(st.notes)}</dd>` : ''}</dl>`).join('')}
      <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`
    const win = window.open('', '_blank'); if (!win) { alert('Sta pop-ups toe om het verslag te openen.'); return }
    win.document.write(html); win.document.close()
  }
  return <Modal onClose={onClose}><h2>Verslag</h2><pre>{txt}</pre>
    <div className="row"><button className="primary" onClick={copy}>Kopieer</button>
      {navigator.share && <button onClick={() => navigator.share({ title: 'Verslag ' + match.opp, text: txt }).catch(() => {})}>Deel</button>}
      <button onClick={print}>PDF / afdrukken</button><button className="ghost" onClick={onClose}>Sluit</button></div></Modal>
}
