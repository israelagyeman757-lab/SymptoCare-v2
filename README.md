# SymptoCare

A Ghana-focused healthcare information and education web app in English and Twi.
SymptoCare is an **educational and navigation tool** — it is not a substitute for a
doctor, pharmacist, or emergency services, and it never prescribes medicine.

## Features

- English/Twi localisation across the whole interface
- Real Supabase authentication (sign up, sign in, sign out, password reset)
- Deterministic symptom guidance with prominent emergency warnings (no fabricated confidence scores)
- Medicine search over a local Ghana NHIS Medicines List dataset with full provenance
- "Translate to Twi" for medicine details, symptom results, and education content (server-side key)
- Appointment **requests** (requests, not confirmed bookings), stored in the database with Row-Level Security
- Region → clinic selection for appointments (clinics load from the `clinics` table; a region must be chosen before a clinic)
- Optional "Search the web" for symptom guidance and medicine details via a server-side Brave Search call (results are labelled as unreviewed web content)
- Reviewed-style first-aid / CPR and health-education content (flagged as awaiting clinical review)

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Zustand · Supabase (Auth, Postgres, Edge Functions)

## Prerequisites

- Node.js 20+
- A Supabase project (see below)
- A GhanaNLP API subscription key (for Twi translation)

## Environment variables

### Frontend (`.env`)

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

These two values are public by design (they are the Supabase anon/publishable key).
Never put the `sb_secret_...` (service role) key or any third-party key in `VITE_*`
variables — anything prefixed with `VITE_` is bundled into the browser.

### Supabase Edge Function secrets (server-side)

Set with the Supabase CLI (`supabase secrets set NAME=value`) or in the dashboard:

```bash
GHANA_NLP_KEY=...        # GhanaNLP Ocp-Apim-Subscription-Key (required for Twi translation)
BRAVE_SEARCH_API_KEY=... # Brave Search API key (required for "Search the web")
ALLOWED_ORIGIN=https://yourapp.example   # required by translate-content and search-content for CORS
```

`ALLOWED_ORIGIN` is the exact origin the frontend is served from. Requests from any
other origin are rejected by the Edge Functions. `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are provided automatically by the Supabase runtime.

## Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. Apply the migrations in `supabase/migrations/` in filename order (or
   `supabase link --project-ref <ref>` then `supabase db push`). They create:
   - `profiles` and `appointment_requests` with Row-Level Security (init),
   - appointment hardening: status/length constraints, stable facility IDs, and
     a partial unique index against duplicate pending requests,
   - `translation_rate_limits` (per-user hourly counter for Twi translation),
   - `clinics` plus `region`/`clinic_id` on appointment requests,
   - `search_rate_limits` (per-user hourly counter for web search).
3. Configure **Authentication** in the dashboard:
   - Site URL / redirect URLs (e.g. `https://yourapp.example` and its `/auth` path)
   - Email provider (SMTP) for password-reset and confirmation emails
   - Enable/disable email confirmation as your policy requires
4. Load clinics into the `clinics` table (the list is not shipped in the repo):

   ```sql
   insert into public.clinics (name, region, facility_type) values
     ('Korle Bu Teaching Hospital', 'Greater Accra', 'districtHospital'),
     -- ... one row per clinic; region must be one of the 16 Ghana regions
     ('Example Health Centre', 'Ashanti', 'healthCentre');
   ```

   `region` is validated against the 16 official regions. The appointment form
   shows the region dropdown first, then clinics filtered by that region.
5. Deploy the Edge Functions:

   ```bash
   supabase functions deploy translate-content
   supabase functions deploy search-content
   supabase secrets set GHANA_NLP_KEY=...
   supabase secrets set BRAVE_SEARCH_API_KEY=...
   supabase secrets set ALLOWED_ORIGIN=https://yourapp.example
   ```

## Local development

```bash
npm install
npm run dev        # start Vite dev server on http://localhost:5173
```

## Available scripts

```bash
npm run dev        # dev server
npm run build      # type-check (tsc) + production build
npm run preview    # preview the production build
npm run lint       # ESLint
npm test           # Vitest (unit tests)
```

## Deployment

The app is a static SPA. Build it and host `dist/` on any static host. A
`vercel.json` SPA rewrite is included for Vercel; for Netlify add a
`/* -> /index.html 200` redirect rule.

1. Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment
   variables in your host (or in the `.env` used at build time).
2. Build: `npm run build`.
3. Deploy `dist/`.
4. Add the deployed origin (e.g. `https://yourapp.example`) to Supabase
   **Authentication → URL Configuration** redirect URLs.

The Supabase backend (Postgres + Edge Functions) is hosted by Supabase
independently of the static frontend.

## Review status (before public release)

These items are implemented but **require qualified human review** and are
flagged in the UI as such:

- Twi translations (`src/i18n/translations.ts`, `src/data/education.ts`) — review by a fluent Twi speaker with health knowledge.
- Triage rules (`src/lib/triage.ts`) — review by a qualified clinician.
- First-aid / CPR and education content (`src/data/education.ts`) — review against current IFRC/AHA/WHO guidance.

Machine-translated Twi is always labelled "not clinically reviewed".

## Known limitations / not implemented

- **Appointments are requests, not confirmed bookings.** A provider confirmation workflow does not exist yet; the `status` column reserves `confirmed` for it.
- **Web search fallback** calls the Brave Search API server-side. Results are labelled as unreviewed external web content, never as medical advice.
- **Medicine-packaging OCR (photo → medicine name)** is not implemented. Brave Search is keyword search and cannot read an image; that would require a vision/OCR model (e.g. Google Gemini) and its key.
- **Twi text-to-speech** is intentionally not implemented.
- Medicine records come from the NHIS Medicines List (2017) and are flagged "needs review"; the list is not a live availability feed.
