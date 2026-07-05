# Astro_web — Local Setup and Deployment

This repository contains a Vite + React frontend and a Node/Express backend with optional Postgres + Redis support. The backend supports JWT auth, admin workshop CRUD, position caching in Redis, news caching, and a Facebook events importer.

Below are quick start commands, example `.env` templates, Docker Compose usage, and notes for hosting (Render, Supabase, Upstash, Vercel/Netlify).

---

## Quick local (Docker Compose)
This will run Redis, Postgres, and the backend service with automatic database initialization and admin seeding.

```bash
# from repository root
cp .env.docker .env    # optional: customize admin credentials
docker compose up -d --build
docker compose ps
```

When containers are running, the backend will be available at `http://localhost:5000`.

**Access the app:**
- Frontend: `http://localhost:5173` (if running `npm run dev`)
- Backend API: `http://localhost:5000/api`
- Admin Login: username: `admin` password: `adminpass` (or your custom ADMIN_PASS)

The admin user is automatically seeded on startup. After logging in, the Admin panel will appear in the sidebar.

Stop services:

```bash
docker compose down
```

---

## Admin Dashboard

After logging in with admin credentials:

1. Click **"Admin"** in the sidebar (only visible to admins)
2. **Workshops Management:**
   - View all workshops
   - Create new workshops (fill form on the right)
   - Edit existing workshops
   - Delete workshops
3. **Newsletter & Facebook Integration:**
   - Newsletter subscribers are stored locally and can optionally sync to SendGrid/Mailchimp or any webhook service.
   - Manage subscribers and delete stale email addresses from the Admin panel.
   - Click "Fetch Facebook Events" to pull events from your Facebook page.
   - Requires `FACEBOOK_PAGE_ID` and `FACEBOOK_ACCESS_TOKEN` in backend `.env`.
4. **Paste JWT Token:**
   - Admin panel can work standalone by pasting your JWT token in the token field.
   - Token is automatically saved in `localStorage` on login.

---

Backend:

```bash
cd backend
npm install
# configure backend/.env (see template below)
npm start
```

Frontend (from project root):

```bash
npm install
# set VITE_NEWS_API_URL in .env
npm run dev
```

The frontend runs via Vite (default at http://localhost:5173).

---

## Example .env files

Backend (`backend/.env`):

```
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Use one of the following DB options. If you set DATABASE_URL, Postgres will be used.
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis connection (used for position and caching). Example for local docker-compose:
REDIS_URL=redis://127.0.0.1:6379

# Optional external API / credentials
NEWS_API_URL=
FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=

# Optional newsletter integration
# SendGrid example: set both values to add subscribers automatically.
SENDGRID_API_KEY=
SENDGRID_LIST_ID=

# Mailchimp example: set server prefix, API key, and list ID to add subscribers automatically.
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
MAILCHIMP_SERVER_PREFIX=

# Optional admin seed credentials
ADMIN_USER=admin
ADMIN_PASS=strongpassword
```

Frontend (`.env` in project root for Vite):

```
VITE_NEWS_API_URL=https://api.spaceflightnewsapi.net/v4/articles?limit=6
```

Notes:
- If you host the frontend on a different domain, set `VITE_NEWS_API_URL` to the news API endpoint you prefer.
- Backend `NEWS_API_URL` is a fallback/cache; the frontend calls the news API directly and caches in `localStorage`.

---

## Hosting recommendations (free / low-cost options)

### Database & Cache
- **Postgres (free):** Supabase, Neon, or ElephantSQL
  - Supabase: https://supabase.com (free tier includes 500 MB Postgres database)
  - Neon: https://neon.tech (free tier with generous limits)
  - ElephantSQL: https://www.elephantsql.com (20 MB free)
- **Redis (free):** Upstash https://upstash.com (free tier: 10k commands/day)

### Backend Hosting
- **Render.com** (recommended for this project)
  - Free tier: up to 0.5 GB RAM, auto-sleeps after 15 min of inactivity
  - Paid tiers: $7/month+ for persistent services
- **Railway.sh** - new free tier alternative
- **Replit** - simple Python/Node hosting (free tier available)

### Frontend Hosting
- **Vercel** https://vercel.com - optimized for Vite/React (free)
- **Netlify** https://netlify.com - great for static sites (free)
- **GitHub Pages** - static only, need to build frontend separately

---

## Complete Deployment Guide (Render + Supabase + Upstash)

### Step 1: Prepare services on free providers

#### A. Create Postgres database (Supabase)
1. Go to https://supabase.com → Sign up (free)
2. Create a new project
3. In Project Settings → Database, copy the connection string: `postgresql://postgres:password@host:5432/postgres`
4. Keep this handy for backend env

#### B. Create Redis instance (Upstash)
1. Go to https://upstash.com → Sign up (free)
2. Create a new Redis database (free tier)
3. Copy the UPSTASH_REDIS_URL (looks like `redis://:password@host:6379`)
4. Keep this handy for backend env

### Step 2: Deploy Backend (Render)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/yourusername/Astro_web.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Render.com**
   - Sign up with GitHub
   - Dashboard → "New" → "Web Service"
   - Select your GitHub repo
   - **Settings:**
     - Name: `astro-backend`
     - Root Directory: `backend`
     - Build Command: `npm ci`
     - Start Command: `npm start`
     - Environment: `Node`
     - Instance Type: `Free` (optional: upgrade to $7/mo paid if needed)

3. **Add Environment Variables** (Render Dashboard → Environment)
   ```
   PORT=5000
   JWT_SECRET=your_very_long_random_secret_here_min_32_chars
   JWT_EXPIRES_IN=7d
   DATABASE_URL=postgresql://postgres:password@host:5432/postgres
   REDIS_URL=redis://:password@host:6379
   ADMIN_USER=admin
   ADMIN_PASS=your_secure_admin_password_here
   ```

4. **Deploy & Seed Admin**
   - Render auto-deploys on git push
   - Once deployed, in Render Shell tab:
     ```bash
     cd backend && npm run seed-admin
     ```
   - Check logs for "✓ Admin user created"

### Step 3: Deploy Frontend (Vercel)

1. **Go to Vercel.com** → Sign up with GitHub
   - Select your GitHub repo
   - **Project Settings:**
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

2. **Add Environment Variables** (Vercel → Settings → Environment)
   ```
   VITE_NEWS_API_URL=https://api.spaceflightnewsapi.net/v4/articles?limit=6
   ```

3. **Key note:** Frontend needs to know backend URL
   - If backend is on Render (`https://astro-backend.onrender.com`), you need to either:
     - Update API_BASE in `src/services/api.js` to the Render URL, OR
     - Use middleware/proxy

   Quick fix - update `src/services/api.js`:
   ```javascript
   const API_BASE = process.env.VITE_BACKEND_URL || '';
   ```
   Then add `VITE_BACKEND_URL=https://astro-backend.onrender.com` to Vercel env.

4. **Deploy:** Auto-deploys on git push

### Step 4: Access Your App

- **Frontend:** `https://your-vercel-app.vercel.app`
- **Backend:** `https://astro-backend.onrender.com/api/auth/login`
- **Admin Login:** username: `admin` / password: (from ADMIN_PASS env)

---

## Security Best Practices (Production)

1. **JWT_SECRET:** Use a strong, random string (min 32 chars)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Admin Credentials:** Change default password immediately after deployment
   ```bash
   # Via backend shell or your hosting provider's terminal
   ADMIN_USER=admin ADMIN_PASS=new_secure_password npm run seed-admin
   ```

3. **Environment Variables:** Never commit `.env` files. Keep secrets in hosting platform's env settings.

4. **CORS:** Update CORS in `backend/index.js` for production:
   ```javascript
   const corsOptions = {
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   };
   app.use(cors(corsOptions));
   ```

5. **Database Backups:** 
   - Supabase: automatic daily backups (free tier)
   - Upstash: backup periodically via dashboard

6. **Monitor Logs:**
   - Render: Dashboard → Logs
   - Vercel: Deployments → Logs

---

## Troubleshooting Deployment

### Backend won't start on Render
- Check logs for missing env variables
- Verify DATABASE_URL is correct
- Try `npm run seed-admin` in shell

### Frontend can't reach backend
- Verify API_BASE points to correct Render URL
- Check CORS settings in backend
- Add `VITE_BACKEND_URL` to Vercel env

### Redis connection error
- Verify REDIS_URL format: `redis://:password@host:6379`
- Check Upstash dashboard for IP restrictions
- If Render "Free" tier, Redis might not work due to network; upgrade or use serverless Redis alternative

### Admin login fails
- Verify ADMIN_USER/ADMIN_PASS were used in `npm run seed-admin`
- Check backend logs in Render shell
- Reseed: `ADMIN_USER=admin ADMIN_PASS=newpass npm run seed-admin`

---

## Estimated Costs (Monthly, after free tier)

- **Render Backend:** $7/month (for persistent service, no auto-sleep)
- **Supabase Database:** Free tier very generous (500 MB database)
- **Upstash Redis:** Free tier very generous (10k commands/day); paid start at $0.20/GB
- **Vercel Frontend:** Free
- **Total:** $7-15/month for a small-medium hobby project

Free tier should be fine for testing/demo; upgrade individual services as needed.

---

## Database migration & seeding

- The backend auto-creates tables on startup for both sqlite (local) and Postgres (if `DATABASE_URL` present).
- Use the `npm run seed-admin` script (in `backend`) to create an admin user. Set `ADMIN_USER`/`ADMIN_PASS` as env variables before running or edit `seedAdmin.js`.

Example:

```bash
cd backend
export DATABASE_URL=postgresql://user:pass@host:5432/dbname    # optional
export ADMIN_USER=admin
export ADMIN_PASS=strongpassword
npm run seed-admin
```

---

## Admin access

- Log in via the app's Login page (username/password). The returned JWT is stored in `localStorage` and the frontend will show the Admin link only when the token payload has `is_admin: true`.
- Backend admin endpoints require the admin JWT in `Authorization: Bearer <token>`.

---

## Troubleshooting

- If `docker compose` isn't recognized, use your Docker install's compose plugin: `docker compose` (new) or install the legacy `docker-compose` binary.
- If the backend cannot connect to Postgres, ensure `DATABASE_URL` is valid and reachable from the host (if using cloud Postgres, ensure allowed network access).
- For Redis connection errors with Upstash, use the provided connection string exactly and verify network reachability.

---

If you want, I can add a small deployment script for Render (e.g., `render.yaml`) or generate a simple migration to move existing sqlite rows to Postgres. Would you like me to add that next?
# Astro_web

Welcome to the Astro_web project! This is a dynamic React-based web application providing a platform for space enthusiasts. It features a modern, cosmic-themed design with interactive dashboards, sky maps, and educational workshops.

## Project Structure

```
Astro_web/
├── index.html        # Entry HTML file
├── package.json      # Project dependencies and scripts
├── vite.config.js    # Vite bundler configuration
├── src/              # Main source code directory
│   ├── index.css     # Global styles and design system
│   ├── App.css       # App-specific styles
│   ├── main.jsx      # React entry point
│   ├── App.jsx       # Root component handling routing and layout
│   ├── components/   # Reusable UI components (Sidebar, Topbar, Dashboard, etc.)
│   ├── services/     # Backend integration and API services (e.g., api.js)
│   └── assets/       # Static assets like images and icons
├── public/           # Publicly served assets
└── dist/             # Production build output (generated upon build)
```

## Features

- **Dashboard**: A central hub for club statistics and updates.
- **Magazine**: Read articles and featured posts about astronomy.
- **Sky Map**: Interactive tools for exploring the night sky.
- **Workshops**: Browse, search, and join live or archived educational workshops (Data driven by mock API backend).
- **Authentication**: Login and Account management pages ready for backend integration.

## Getting Started

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Build for production: `npm run build`

## Design System

The application uses a custom cosmic-themed design system centered around `index.css`, employing modern CSS features like CSS variables, flexbox, grid, and glassmorphism for a premium aesthetic.
