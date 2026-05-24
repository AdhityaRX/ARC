# Deploy ARC HR

Two preview paths. Pick the one that matches what's in front of you.

---

## Option A — Vercel + Neon (public URL, ~5 minutes)

Best for previewing on an iPad: gives you a real `https://your-app.vercel.app` URL.

### 1. Create a free Postgres database on Neon
1. Sign up at [neon.tech](https://neon.tech).
2. Create a project (any region — pick the closest to your Vercel region).
3. On the project dashboard, copy the **pooled connection string** (looks like
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).

### 2. Deploy to Vercel
1. Push this repo to GitHub (already done if you're reading this in PR review).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** this repo.
3. Vercel detects Next.js automatically. Before clicking Deploy, add three
   environment variables:

   | Name               | Value                                                                |
   | ------------------ | -------------------------------------------------------------------- |
   | `DATABASE_URL`     | (the Neon pooled connection string from step 1)                      |
   | `AUTH_SECRET`      | Run `openssl rand -base64 32` locally and paste the output           |
   | `NEXTAUTH_URL`     | Leave blank for now — fill in after first deploy with the Vercel URL |

4. Click **Deploy**. `vercel.json` runs `prisma migrate deploy` during the
   build, so the tables exist on first deploy.

### 3. Seed the Super Admin (one-time)
The Super Admin account is created by the seed script. Easiest path:

```bash
# locally, with the SAME Neon DATABASE_URL set
git pull
npm install
DATABASE_URL="postgresql://..." npm run db:seed
```

That creates `admin@arc.dev / admin123` (change the password right after first
login by editing the user in the admin panel).

Alternative: open the Neon SQL Editor and paste:
```sql
INSERT INTO users (id, email, name, password_hash, role, updated_at)
VALUES (
  gen_random_uuid()::text,
  'admin@arc.dev',
  'Super Admin',
  -- bcrypt of 'admin123' (cost 12)
  '$2b$12$oOKmzxdCBAUbON8xhJscxOqpG41oGDVZM/L3YOupnh7UbmFw.dPm.',
  'super_admin',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
```

### 4. Set `NEXTAUTH_URL` and redeploy
1. In Vercel → Settings → Environment Variables, set
   `NEXTAUTH_URL=https://your-app.vercel.app` (no trailing slash).
2. Redeploy (Deployments → ••• → Redeploy on the latest commit).

### 5. Configure the Anthropic API key
1. Open the Vercel URL on your iPad → sign in as `admin@arc.dev / admin123`.
2. Sidebar → **Admin Settings** → **Settings** tab.
3. Paste your Anthropic API key → Save. Model defaults to `claude-opus-4-7`.
4. **Users** tab → **Create User** to add HR accounts.

---

## Option B — Docker Compose (local, browse from iPad on same Wi-Fi)

Best for testing without signing up anywhere. iPad must be on the same Wi-Fi as
the host machine.

### Prerequisites
- Docker Desktop (Mac/Windows) or `docker` + `docker compose` (Linux).

### Run
```bash
# Optional: set your own secret + Anthropic key
export AUTH_SECRET="$(openssl rand -base64 32)"
export ANTHROPIC_API_KEY="sk-ant-..."        # or set it later in the UI
export NEXTAUTH_URL="http://192.168.1.42:3000"   # your machine's LAN IP

docker compose up --build
```

The container's entrypoint waits for Postgres, runs `prisma migrate deploy`,
seeds the super admin (idempotent), then starts Next.js.

- On the host: open `http://localhost:3000`.
- On the iPad (same Wi-Fi): open `http://<your-mac-ip>:3000`. Find your IP with
  `ipconfig getifaddr en0` on macOS or `hostname -I` on Linux.

### First login
`admin@arc.dev / admin123` — go to Admin Settings → paste your Anthropic key →
create HR users.

### Stop / wipe
```bash
docker compose down        # stop, keep data
docker compose down -v     # stop + delete the Postgres volume
```

---

## Option C — Just run it locally (no Docker)

```bash
# 1. Start Postgres however you like (Homebrew, Postgres.app, an existing instance...)
# 2. Configure env
cp .env.example .env
#   Set DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL=http://localhost:3000

# 3. Install + migrate + seed
npm install
npm run db:deploy        # applies migrations to your DB
npm run db:seed          # creates admin@arc.dev / admin123

# 4. Run
npm run dev
```

For iPad access, tunnel via `npx ngrok http 3000` and open the https URL it
prints.

---

## Anthropic API & model

- The Super Admin sets the Anthropic API key from **Admin → Settings**. It's
  stored in the `system_settings` table — HR users never see it.
- `ANTHROPIC_API_KEY` env var is a fallback if no key is configured in the DB.
- Default model is `claude-opus-4-7`. Override from the same Settings page
  (Sonnet 4.6 / Haiku 4.5 also available).

## Function timeouts (Vercel only)

`vercel.json` raises `maxDuration` to 300s for the two analysis endpoints
(resume upload + re-analyze) because Opus 4.7 can take 30–90s on a long resume.
On Vercel's Hobby plan the cap is 60s — if you stay on Hobby, expect occasional
timeouts on very long PDFs. Pro plan supports the full 300s.
