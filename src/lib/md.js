// Kleine Markdown-naar-HTML omzetter voor de handleiding (koppen, lijsten, tabellen, vet, code, links).
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
const slug = s => s.toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]+/g, '-').replace(/^-|-$/g, '')
export function mdToHtml(md) {
  const lines = md.split('\n'); const out = []; const toc = []
  let i = 0, list = null, para = []
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = [] } }
  const flushList = () => { if (list) { out.push(`</${list}>`); list = null } }
  while (i < lines.length) {
    const l = lines[i]
    if (l.startsWith('```')) { flushPara(); flushList(); const buf = []; i++; while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]); out.push(`<pre>${esc(buf.join('\n'))}</pre>`); i++; continue }
    const h = l.match(/^(#{1,4})\s+(.*)/)
    if (h) { flushPara(); flushList(); const lvl = h[1].length, txt = h[2], id = slug(txt); if (lvl <= 3) toc.push({ lvl, txt, id }); out.push(`<h${lvl} id="${id}">${inline(txt)}</h${lvl}>`); i++; continue }
    if (/^\s*---\s*$/.test(l)) { flushPara(); flushList(); out.push('<hr>'); i++; continue }
    if (l.startsWith('|')) { flushPara(); flushList(); const rows = []; while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++])
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      const body = rows.filter(r => !/^\|\s*-/.test(r))
      out.push(`<table><thead><tr>${cells(body[0]).map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.slice(1).map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue }
    const li = l.match(/^\s*([-*]|\d+\.)\s+(.*)/)
    if (li) { flushPara(); const kind = /\d/.test(li[1]) ? 'ol' : 'ul'; if (list !== kind) { flushList(); out.push(`<${kind}>`); list = kind } out.push(`<li>${inline(li[2])}</li>`); i++; continue }
    if (l.startsWith('>')) { flushPara(); flushList(); out.push(`<blockquote>${inline(l.slice(1).trim())}</blockquote>`); i++; continue }
    if (!l.trim()) { flushPara(); flushList(); i++; continue }
    para.push(l.trim()); i++
  }
  flushPara(); flushList()
  return { html: out.join('\n'), toc }
}
