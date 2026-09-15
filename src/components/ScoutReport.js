// Rapport in Data Volley-stijl als afdrukbare HTML (PDF via de printdialoog van de browser).
import { statsRows, rotationStats, attackDirections, distribution } from '../lib/scout.js'
import { matchState, fmt, playedSet } from '../lib/volley.js'

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
// zonecentra op een verticaal veld 120x200: bovenhelft tegenstander (gespiegeld), onderhelft wij
const ZC = { us: { 4: [20, 130], 3: [60, 130], 2: [100, 130], 5: [20, 175], 6: [60, 175], 1: [100, 175] },
             them: { 2: [20, 70], 3: [60, 70], 4: [100, 70], 1: [20, 25], 6: [60, 25], 5: [100, 25] } }
const COL = { '#': '#1F8A4C', '+': '#5C6780', '!': '#5C6780', '-': '#B3261E', '/': '#B3261E', '=': '#B3261E' }
function courtSvg(dirs) {
  const arrows = dirs.filter(d => d.to).map(d => { const [x1, y1] = ZC.us[d.from], [x2, y2] = ZC.them[d.to]
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COL[d.q] || '#333'}" stroke-width="1.6" marker-end="url(#a)" opacity=".85"/>` }).join('')
  const dots = dirs.filter(d => !d.to).map(d => { const [x, y] = ZC.us[d.from]; return `<circle cx="${x + (Math.random() * 10 - 5)}" cy="${y + (Math.random() * 10 - 5)}" r="2.5" fill="${COL[d.q] || '#333'}"/>` }).join('')
  return `<svg viewBox="0 0 120 200" width="120" height="200"><defs><marker id="a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#333"/></marker></defs>
    <rect x="1" y="1" width="118" height="198" fill="#FBE7D3" stroke="#333"/><line x="0" x1="1" y1="100" x2="119" y2="100" stroke="#000" stroke-width="3"/>
    <line x1="1" y1="50" x2="119" y2="50" stroke="#999" stroke-dasharray="3 2"/><line x1="1" y1="150" x2="119" y2="150" stroke="#999" stroke-dasharray="3 2"/>
    ${arrows}${dots}</svg>`
}
export function reportHtml(match, scout, roster, teamName) {
  const sets = match.sets.filter(playedSet)
  const { w, l } = matchState(match); const rot = rotationStats(match, scout, roster)
  const tbl = team => { const rows = statsRows(scout, team, roster); const tot = k => rows.reduce((a, r) => a + (r[k] || 0), 0)
    return `<table><thead><tr><th>Speler</th><th colspan="3">Opslag</th><th colspan="3">Receptie</th><th colspan="4">Aanval</th><th colspan="2">Blok</th><th>Verd</th></tr>
      <tr><th></th><th>tot</th><th>ace</th><th>fout</th><th>tot</th><th>pos%</th><th>fout</th><th>tot</th><th>kill</th><th>fout</th><th>eff</th><th>pt</th><th>ass</th><th>tot</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${esc(r.nr)} ${esc(r.name)}</td><td>${r.srvN || ''}</td><td>${r.aces || ''}</td><td>${r.srvErr || ''}</td><td>${r.recN || ''}</td><td>${r.recPos}</td><td>${r.recErr || ''}</td><td>${r.attN || ''}</td><td>${r.kills || ''}</td><td>${r.attErr || ''}</td><td>${r.eff}</td><td>${r.blk || ''}</td><td>${r.ass || ''}</td><td>${r.dig || ''}</td></tr>`).join('')}
      <tr class="tot"><td>Totaal</td><td>${tot('srvN')}</td><td>${tot('aces')}</td><td>${tot('srvErr')}</td><td>${tot('recN')}</td><td></td><td>${tot('recErr')}</td><td>${tot('attN')}</td><td>${tot('kills')}</td><td>${tot('attErr')}</td><td></td><td>${tot('blk')}</td><td>${tot('ass')}</td><td>${tot('dig')}</td></tr></tbody></table>` }
  const dirs = attackDirections(scout, 'us')
  const dirBlocks = Object.entries(dirs).map(([nr, ds]) => { const p = roster.find(x => x.nr === nr); const k = ds.filter(d => d.q === '#').length, e = ds.filter(d => d.q === '=' || d.q === '/').length
    return `<div class="pl"><div class="nm">${esc(nr)} ${esc(p?.name || '')}</div>${courtSvg(ds)}<div class="sm">${ds.length} aanv · ${k} kill · ${e} fout · eff ${ds.length ? Math.round(100 * (k - e) / ds.length) : 0}%</div></div>` }).join('')
  const dist = distribution(scout)
  const distCourt = r => { const pc = z => r.total ? Math.round(100 * r.zones[z] / r.total) : 0; const back = r.total ? Math.round(100 * (r.zones[1] + r.zones[5] + r.zones[6]) / r.total) : 0
    const cell = (x, y, v) => `<rect x="${x}" y="${y}" width="38" height="28" fill="rgba(36,86,184,${(v / 100) * .9 + .05})" stroke="#fff"/><text x="${x + 19}" y="${y + 18}" text-anchor="middle" font-size="11" font-weight="700" fill="${v > 45 ? '#fff' : '#111'}">${v}%</text>`
    return `<svg viewBox="0 0 120 70" width="120" height="70"><rect x="1" y="1" width="118" height="68" fill="#FBE7D3" stroke="#333"/><line x1="1" y1="2" x2="119" y2="2" stroke="#000" stroke-width="3"/>${cell(2, 4, pc(4))}${cell(41, 4, pc(3))}${cell(80, 4, pc(2))}<rect x="2" y="34" width="116" height="34" fill="rgba(36,86,184,${(back / 100) * .9 + .05})" stroke="#fff"/><text x="60" y="55" text-anchor="middle" font-size="11" font-weight="700">achter ${back}%</text></svg>` }
  const distBlocks = dist.filter(r => r.total).map(r => `<div class="pl"><div class="nm">R${r.rot + 1} · ${r.total} aanv.</div>${distCourt(r)}<div class="sm">${r.goodN ? `goede bal: z4 ${Math.round(100 * r.good[4] / r.goodN)}% · z3 ${Math.round(100 * r.good[3] / r.goodN)}% · z2 ${Math.round(100 * r.good[2] / r.goodN)}%` : ''}${r.pas.length ? `<br>pas ${Math.round(100 * r.pas.filter(q => q === '#' || q === '+').length / r.pas.length)}% goed` : ''}</div></div>`).join('')
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Scouting ${esc(match.opp)}</title><style>
    body{font:11px/1.35 Helvetica,Arial,sans-serif;color:#111;margin:14mm 12mm}h1{font-size:18px;margin:0}h2{font-size:13px;margin:14px 0 6px;border-bottom:1px solid #999;padding-bottom:2px}
    .sub{color:#555;margin:2px 0 10px}table{border-collapse:collapse;width:100%;margin-bottom:8px}th,td{border:1px solid #bbb;padding:3px 5px;text-align:right;font-size:10.5px}th:first-child,td:first-child{text-align:left}
    th{background:#eee;font-weight:600}tr.tot td{font-weight:700;background:#f5f5f5}.grid{display:flex;flex-wrap:wrap;gap:10px}.pl{width:130px;text-align:center}.nm{font-weight:700;margin-bottom:3px}.sm{font-size:9.5px;color:#555}
    .leg{font-size:9.5px;color:#555;margin-top:4px}@media print{@page{margin:10mm}body{margin:0}h2{break-after:avoid}.grid{break-inside:avoid}}</style></head><body>
    <h1>${esc(teamName)} – ${esc(match.opp)}</h1><div class="sub">${match.home ? 'Thuis' : 'Uit'} · ${fmt(match.date)}${sets.some(st => st.us !== '') ? ` · Uitslag ${w}–${l} (${sets.map(st => `${st.us || '?'}-${st.them || '?'}`).join(', ')})` : ''}</div>
    <h2>${esc(teamName)}</h2>${tbl('us')}
    <h2>Side-out en break per rotatie</h2><table><thead><tr><th>Rotatie</th><th>Server (set 1)</th><th>Ontvangen</th><th>Side-out</th><th>SO%</th><th>Geserveerd</th><th>Break</th><th>Break%</th></tr></thead><tbody>
    ${rot.map(r => `<tr><td>R${r.rot + 1}</td><td>${esc(r.server)}</td><td>${r.recv}</td><td>${r.so}</td><td>${r.soPct ?? ''}${r.soPct != null ? '%' : ''}</td><td>${r.serve}</td><td>${r.brk}</td><td>${r.brkPct ?? ''}${r.brkPct != null ? '%' : ''}</td></tr>`).join('')}</tbody></table>
    <div class="leg">Rotatie 1 = startopstelling; elke side-out draait één positie door. SO% = gewonnen rallies bij ontvangst; Break% = gewonnen rallies op eigen opslag.</div>
    ${distBlocks ? `<h2>Spelverdeling ${esc(teamName)} per rotatie</h2><div class="grid">${distBlocks}</div><div class="leg">Aandeel van de aanvallen per zone, per rotatie (R1 = startopstelling). Eronder de verdeling na een goede eerste bal (# of +) en de kwaliteit van de pas als die getagd is.</div>` : ''}
    ${dirBlocks ? `<h2>Aanvalsrichtingen ${esc(teamName)}</h2><div class="grid">${dirBlocks}</div><div class="leg">Pijl van aanvalszone naar landingszone bij de tegenstander. Groen = punt, grijs = in spel, rood = fout/geblokt. Punt = aanval zonder landingszone.</div>` : ''}
    <h2>${esc(match.opp)}</h2>${tbl('them')}
    <div class="leg">Rec pos% = receptie # of +. Eff = (kills − fouten − geblokt) / aanvallen. Gegenereerd met Scouting (TripleSpark).</div>
    <script>window.onload=()=>setTimeout(()=>window.print(),300)<\\/script></body></html>`
}
