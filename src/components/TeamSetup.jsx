import { useState } from 'react'
import * as db from '../lib/db.js'
export default function TeamSetup({ onCreated }) {
  const [name, setName] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  async function create(e) { e.preventDefault(); setBusy(true); setErr(''); try { onCreated(await db.createTeam(name.trim())) } catch (x) { setErr(x.message) } setBusy(false) }
  return <div className="auth"><h1>Welkom</h1><p>Maak je ploeg aan. Je kunt later andere coaches toevoegen op e-mail.</p>
    <form onSubmit={create}><input required placeholder="Ploegnaam, bv. VNK Dames A" value={name} onChange={e => setName(e.target.value)} /><button className="primary" disabled={busy}>Ploeg aanmaken</button></form>
    {err && <p className="err">{err}</p>}</div>
}
