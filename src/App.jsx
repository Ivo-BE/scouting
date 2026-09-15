import { useEffect, useRef, useState } from 'react'
import { supabase, configured } from './lib/supabase.js'
import * as db from './lib/db.js'
import { newMatch, fixMatch, csv, today } from './lib/volley.js'
import Auth from './components/Auth.jsx'
import TeamSetup from './components/TeamSetup.jsx'
import Roster from './components/Roster.jsx'
import Match from './components/Match.jsx'
import History from './components/History.jsx'
import Report from './components/Report.jsx'
import Stats from './components/Stats.jsx'
import Modal from './components/Modal.jsx'
import Scout from './components/Scout.jsx'

const DRAFT = 'opstellingen:draft'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [teams, setTeams] = useState(null); const [team, setTeam] = useState(null)
  const [roster, setRoster] = useState([]); const [matches, setMatches] = useState([])
  const [match, setMatch] = useState(() => { try { const d = JSON.parse(localStorage.getItem(DRAFT)); return d ? fixMatch(d) : newMatch() } catch { return newMatch() } })
  const [modal, setModal] = useState(null)     // {type:'report',match} | {type:'stats'} | {type:'members'}
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('')
  const [view, setView] = useState('match')
  const fileRef = useRef(); const backupRef = useRef()

  const flash = t => { setMsg(t); setTimeout(() => setMsg(m => m === t ? '' : m), 2500) }
  const fail = e => { console.error(e); setErr(e.message || String(e)); setTimeout(() => setErr(''), 12000) }

  useEffect(() => {
    if (!configured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (session) db.myTeams().then(ts => { setTeams(ts); setTeam(ts[0] || null) }).catch(fail) }, [session])
  useEffect(() => {
    if (!team) return
    Promise.all([db.loadPlayers(team.id), db.loadMatches(team.id)]).then(([p, m]) => { setRoster(p); setMatches(m) }).catch(fail)
  }, [team])
  useEffect(() => { localStorage.setItem(DRAFT, JSON.stringify(match)) }, [match])   // concept overleeft een herlaad

  async function save() {
    if (!match.opp.trim()) { flash('Vul eerst de tegenstander in'); document.getElementById('opp')?.focus(); return }
    try { const saved = await db.saveMatch(team.id, match); setMatch(saved)
      setMatches(ms => [saved, ...ms.filter(m => m.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date))); flash('Wedstrijd bewaard') } catch (e) { fail(e) }
  }
  function open(m) { setMatch(fixMatch(JSON.parse(JSON.stringify(m)))); document.getElementById('match')?.scrollIntoView({ behavior: 'smooth' }) }
  function copy(m) {
    const c = fixMatch(JSON.parse(JSON.stringify(m))); c.id = null; c.opp = ''; c.date = today()
    c.sets = c.sets.map(s => ({ ...s, us: '', them: '', subs: [], notes: '', timeouts: [], rot: 0, locked: false, hist: [] }))
    setMatch(c); document.getElementById('match')?.scrollIntoView({ behavior: 'smooth' }); flash('Opstelling overgenomen')
  }
  async function saveScout(m, scout) {
    try { const saved = await db.saveScout(m.id, scout); setMatches(ms => ms.map(x => x.id === m.id ? { ...x, scout: saved } : x)) } catch (e) { fail(e) }
  }
  async function del(m) { if (!confirm(`Wedstrijd tegen ${m.opp} verwijderen?`)) return; try { await db.deleteMatch(m.id); setMatches(ms => ms.filter(x => x.id !== m.id)); if (match.id === m.id) setMatch(newMatch()) } catch (e) { fail(e) } }
  function download(name, content, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click() }
  const LASTB = 'scouting:lastbackup'
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem(LASTB) || '')
  async function backup() {
    try { const b = await db.exportBackup(team); download(`backup-${team.name.replace(/\s+/g, '-')}-${today()}.json`, JSON.stringify(b, null, 2), 'application/json')
      localStorage.setItem(LASTB, today()); setLastBackup(today()); flash('Backup gedownload') } catch (e) { fail(e) }
  }
  async function restore(e) {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return
    try { const b = JSON.parse((await f.text()).replace(/^\uFEFF/, ''))
      if (b.format !== 'scouting-backup' && Array.isArray(b.roster)) { fail(new Error(`${f.name} is een export van de oude app — gebruik "Importeer oude export"`)); return }
      if (!confirm(`Backup van ${b.team?.name || '?'} (${b.exported_at?.slice(0, 10)}) terugzetten in ${team.name}? Bestaande spelers en wedstrijden met hetzelfde id worden overschreven; er wordt niets verwijderd.`)) return
      const r = await db.restoreBackup(team.id, b); setRoster(await db.loadPlayers(team.id)); setMatches(await db.loadMatches(team.id)); flash(`${r.players} spelers en ${r.matches} wedstrijden hersteld`) } catch (x) { fail(x) }
  }
  const backupOld = !lastBackup || (Date.now() - new Date(lastBackup).getTime()) > 30 * 86400000
  async function importJson(e) {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return
    let j; try { j = JSON.parse((await f.text()).replace(/^\uFEFF/, '')) } catch { fail(new Error(`${f.name} is geen JSON-bestand`)); return }
    try {
      if (j.format === 'scouting-backup') {           // backup van deze app -> herstellen
        if (!confirm(`${f.name} is een backup van deze app (${j.exported_at?.slice(0, 10)}). Terugzetten in ${team.name}?`)) return
        const r = await db.restoreBackup(team.id, j); setRoster(await db.loadPlayers(team.id)); setMatches(await db.loadMatches(team.id)); flash(`${r.players} spelers en ${r.matches} wedstrijden hersteld`); return
      }
      if (!Array.isArray(j.roster)) throw new Error(`${f.name}: geen spelerslijst (roster) gevonden — is dit de export van de oude Opstellingen-app? Die heet opstellingen-….json`)
      if (!Array.isArray(j.matches)) j.matches = []
      if (!confirm(`${j.roster.length} spelers en ${j.matches.length} wedstrijden uit ${f.name} toevoegen aan ${team.name}?`)) return
      const r = await db.importLegacy(team.id, j); setRoster(await db.loadPlayers(team.id)); setMatches(await db.loadMatches(team.id)); flash(`${r.players} spelers en ${r.matches} wedstrijden geïmporteerd`) } catch (x) { fail(x) }
  }

  if (!configured) return <div className="auth"><h1>Opstellingen</h1><p className="err">Supabase is niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env (lokaal) of in de Vercel-omgevingsvariabelen.</p></div>
  if (session === undefined) return <div className="auth"><p>Laden…</p></div>
  if (!session) return <Auth />
  if (teams === null) return <div className="auth"><p>Laden…</p></div>
  if (!team) return <TeamSetup onCreated={t => { setTeams([t]); setTeam(t) }} />

  return <div className="wrap">
    <header>
      <div><h3>Scouting</h3>
        <input className="team" defaultValue={team.name} onBlur={e => { const n = e.target.value.trim(); if (n && n !== team.name) db.renameTeam(team.id, n).then(() => setTeam({ ...team, name: n })).catch(fail) }} /></div>
      <div><div className="status">{session.user.email}{teams.length > 1 && <> · <select value={team.id} onChange={e => setTeam(teams.find(t => t.id === e.target.value))}>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></>}</div>
        <div className="io">
          <button className={view === 'match' ? 'on' : ''} onClick={() => setView('match')}>Wedstrijd</button>
          <button className={view === 'scout' ? 'on' : ''} onClick={() => setView('scout')}>Scout</button>
          <button onClick={() => setModal({ type: 'members' })}>Coach toevoegen</button>
          <button onClick={() => download(`seizoen-${team.name.replace(/\s+/g, '-')}-${today()}.csv`, csv(matches, roster), 'text/csv;charset=utf-8')}>Seizoen als Excel</button>
          <button onClick={() => fileRef.current.click()}>Importeer oude export</button><input ref={fileRef} type="file" accept=".json" hidden onChange={importJson} />
          <button className={backupOld ? 'warnbtn' : ''} onClick={backup} title={lastBackup ? 'Laatste backup ' + lastBackup : 'Nog geen backup gemaakt op dit toestel'}>Backup{backupOld ? ' !' : ''}</button>
          <button onClick={() => backupRef.current.click()}>Herstel</button><input ref={backupRef} type="file" accept=".json" hidden onChange={restore} />
          <button className="ghost" onClick={() => supabase.auth.signOut()}>Uitloggen</button>
        </div></div>
    </header>
    {(msg || err) && <div className={'toast ' + (err ? 'err' : '')}>{err || msg}</div>}
    {view === 'scout' ? <Scout matches={matches} roster={roster} teamName={team.name} onSaveScout={saveScout} flash={flash} /> :
    <div className="grid">
      <div className="side">
        <Roster teamId={team.id} roster={roster} setRoster={setRoster} onStats={() => setModal({ type: 'stats' })} />
        <History matches={matches} currentId={match.id} onOpen={open} onReport={m => setModal({ type: 'report', match: m })} onCopy={copy} onDelete={del} />
      </div>
      <Match match={match} setMatch={setMatch} roster={roster} onSave={save} onNew={() => setMatch(newMatch())} onReport={() => setModal({ type: 'report', match })} flash={flash} />
    </div>}
    {modal?.type === 'report' && <Report match={modal.match} roster={roster} teamName={team.name} onClose={() => setModal(null)} flash={flash} />}
    {modal?.type === 'stats' && <Stats roster={roster} matches={matches} onClose={() => setModal(null)} />}
    {modal?.type === 'members' && <Members teamId={team.id} onClose={() => setModal(null)} flash={flash} fail={fail} />}
  </div>
}

function Members({ teamId, onClose, flash, fail }) {
  const [email, setEmail] = useState('')
  async function add(e) { e.preventDefault(); try { await db.addMemberByEmail(teamId, email.trim()); flash(`${email} toegevoegd`); onClose() } catch (x) { fail(x) } }
  return <Modal onClose={onClose}><h2>Coach toevoegen</h2><p>Die persoon moet eerst één keer zelf inloggen in de app; daarna kun je hem of haar hier koppelen.</p>
    <form onSubmit={add} className="row"><input type="email" required placeholder="e-mailadres" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1 }} /><button className="primary">Toevoegen</button></form>
    <button className="ghost" onClick={onClose}>Sluit</button></Modal>
}
