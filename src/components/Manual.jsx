import { useMemo, useState } from 'react'
import md from '../../docs/handleiding.md?raw'
import { mdToHtml } from '../lib/md.js'

export default function Manual() {
  const { html, toc } = useMemo(() => mdToHtml(md), [])
  const [q, setQ] = useState('')
  const shown = useMemo(() => {
    if (!q.trim()) return html
    const re = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    return html.replace(/>([^<]+)</g, (m, t) => '>' + t.replace(re, x => `<mark>${x}</mark>`) + '<')
  }, [html, q])
  return <div className="manual">
    <aside className="toc"><input placeholder="Zoek in de handleiding…" value={q} onChange={e => setQ(e.target.value)} />
      <nav>{toc.map(t => <a key={t.id} href={'#' + t.id} className={'l' + t.lvl} onClick={e => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>{t.txt}</a>)}</nav></aside>
    <article className="panel doc" dangerouslySetInnerHTML={{ __html: shown }} />
  </div>
}
