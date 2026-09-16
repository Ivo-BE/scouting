import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Auth() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [err, setErr] = useState('')
  async function send(e) {
    e.preventDefault(); setErr('')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin } })
    if (error) setErr(error.message); else setSent(true)
  }
  return <div className="auth">
    <h1>Scouting</h1>
    <p>Log in met je e-mailadres. Je krijgt een link, geen wachtwoord.</p>
    {sent ? <p className="ok">Link verstuurd naar {email}. Open die op dit toestel.</p> :
      <form onSubmit={send}><input type="email" required placeholder="jij@voorbeeld.be" value={email} onChange={e => setEmail(e.target.value)} /><button className="primary">Stuur inloglink</button></form>}
    {err && <p className="err">{err}</p>}
    <p className="powered">Powered by Triple Spark</p>
  </div>
}
