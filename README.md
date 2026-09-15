# Scouting

Wedstrijd-app voor volleybalcoaches: opstelling per set, wissels volgens de FIVB-regel, rotatie, stand, time-outs, verslag en seizoensstatistieken. Vite + React + Supabase, gehost op Vercel.

## 1. Supabase
1. Maak een project op supabase.com (of gebruik een bestaand project).
2. SQL Editor → plak de inhoud van `supabase/schema.sql` → Run.
3. Authentication → Providers → Email: laat **Magic link** aan. Onder URL Configuration zet je bij *Site URL* en *Redirect URLs* je Vercel-adres (en `http://localhost:5173` voor lokaal).
4. Project Settings → API: noteer *Project URL* en *anon public key*.

## 2. Lokaal draaien (optioneel)
```
npm install
cp .env.example .env      # vul URL en anon key in
npm run dev               # http://localhost:5173
npm test                  # wedstrijdlogica
```

## 3. Vercel
1. Push deze map naar een GitHub-repo (`git init && git add . && git commit -m "init"`; git identity: ivo.van.ham@gmail.com).
2. Vercel → Add New → Project → repo importeren. Framework preset: **Vite**.
3. Environment Variables: `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` zorgt dat alle routes naar de app gaan.

## 4. Eerste gebruik
1. Log in met je e-mailadres (magic link).
2. Maak je ploeg aan.
3. "Importeer oude export" → kies de JSON uit de vorige single-file versie: spelers en wedstrijden worden overgenomen.
4. Chrome → "App installeren" voor het icoon op je startscherm.

## Meerdere coaches
"Coach toevoegen" koppelt een collega op e-mail. Die moet eerst zelf één keer ingelogd zijn.

## Structuur
- `supabase/schema.sql` — tabellen `teams`, `team_members`, `players`, `matches` (sets en scout als JSONB) + RLS. Al eerder uitgevoerd? Draai dan de losse migraties in `supabase/` (`migrations_002_scout.sql`, `migrations_003_setter.sql`).
- `src/lib/volley.js` — pure wedstrijdlogica (wisselregel, rotatie, setwinnaar, undo, verslag, csv). Getest in `tests/`.
- `src/lib/db.js` — alle Supabase-calls, incl. import van de oude export en Backup/Herstel (volledige ploeg als JSON; Herstel voegt toe of overschrijft op id, verwijdert nooit).
- `src/components/` — UI. `SetCard` is het veld per set.
- `public/sw.js` — offline app-shell; data komt altijd van Supabase, het lopende concept staat ook in localStorage.
