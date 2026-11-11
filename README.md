# Tapang Portfolio – React + Express + Prisma 6 + SQLite

Andrei Tapang's creative portfolio with a protected **Admin Dashboard**, a database-driven **Projects**
gallery and a **Contact inbox**.

This version uses **SQLite**: the whole database is **one file** (`backend/portfolio.db`) that Prisma
creates for you.

> ✅ **XAMPP, MySQL and phpMyAdmin are NOT needed any more.** You do not have to start any database
> server. You only need Node.js.

```
React (browser)  ->  Express REST API  ->  Prisma Client 6  ->  SQLite file
 localhost:5173       localhost:3000        (backend only)       backend/portfolio.db
                      └─ uploaded images, videos and PDFs live in backend/uploads/
```

The database file, the admin password and the JWT secret exist **only in `backend/`**. The browser never sees them.

---

## Contents

1. [What you need](#1-what-you-need)
2. [First-time setup – backend (Terminal 1)](#2-first-time-setup--backend-terminal-1)
3. [First-time setup – frontend (Terminal 2)](#3-first-time-setup--frontend-terminal-2)
4. [Normal daily startup](#4-normal-daily-startup)
5. [Important addresses](#5-important-addresses)
6. [Prisma Studio (view and edit the database)](#6-prisma-studio-view-and-edit-the-database)
7. [Using the Admin Dashboard](#7-using-the-admin-dashboard)
8. [All backend commands](#8-all-backend-commands)
9. [Troubleshooting](#9-troubleshooting)
10. [How the database works](#10-how-the-database-works)
11. [GitHub](#11-github)
12. [Deploying online later](#12-deploying-online-later)
13. [Project structure, API and security](#13-project-structure-api-and-security)

---

## 1. What you need

| Tool | Notes |
|---|---|
| **Node.js 22 LTS** (or 20.19+) | Download from <https://nodejs.org>. It includes **npm**. Check in a terminal: `node -v` and `npm -v`. |
| **Visual Studio Code** | <https://code.visualstudio.com>. Recommended extension: **Prisma** (by Prisma) – VS Code suggests it when you open the folder. |
| Internet (first install only) | `npm install` downloads the packages and Prisma's small engine files. |

**Not needed:** XAMPP, MySQL, MariaDB, phpMyAdmin, or any other database program.

---

## 2. First-time setup – backend (Terminal 1)

### Step 1 – Extract the ZIP
Right-click `Tapang_Portfolio_SQLite_ORM_Project.zip` → **Extract All…** → choose a simple location,
for example `C:\Projects\`. You now have the folder `C:\Projects\Tapang_Portfolio_SQLite_ORM_Project`.

> Tip: avoid putting the project inside OneDrive-synced folders (Desktop/Documents on some PCs).
> OneDrive can lock the database file while it syncs.

### Step 2 – Open the folder in VS Code
VS Code → **File → Open Folder…** → select `Tapang_Portfolio_SQLite_ORM_Project` → **Select Folder**.
If VS Code asks "Do you trust the authors?", choose **Yes**.

### Step 3 – Open the first terminal
Menu **Terminal → New Terminal**. A PowerShell terminal opens at the bottom, already inside the project folder.

### Step 4 – Go to the backend folder and install
```powershell
cd backend
npm install
```
Wait until it finishes (about a minute the first time).

### Step 5 – Create your `.env` file
```powershell
Copy-Item .env.example .env
```

### Step 6 – Fill in `.env`
First, create a random secret. Run this and **copy the long text it prints**:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Now open `backend/.env` in VS Code and replace the `YOUR_...` values. Example:

```ini
DATABASE_URL="file:../portfolio.db"          # leave exactly like this
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"

JWT_SECRET="paste-the-long-random-text-here"

ADMIN_NAME="Andrei Tapang"
ADMIN_USERNAME="andrei"                      # 3-60 characters: letters, numbers . _ -
ADMIN_EMAIL="your-real-email@gmail.com"
ADMIN_PASSWORD="Choose-A-Strong-Password-2026"   # 10 to 72 characters
```
Save the file (**Ctrl + S**). You will log in to the dashboard with `ADMIN_USERNAME` (or `ADMIN_EMAIL`) and
`ADMIN_PASSWORD`. The password is stored in the database as a **bcrypt hash**, never as plain text.

> Why `file:../portfolio.db`? Prisma reads a SQLite path starting from the `backend/prisma` folder,
> so `../portfolio.db` means **`backend/portfolio.db`**.

### Step 7 – Check the Prisma schema
```powershell
npm run prisma:validate
```
Expected: `The schema at prisma/schema.prisma is valid 🚀`

### Step 8 – Generate Prisma Client
```powershell
npm run prisma:generate
```
Expected: `✔ Generated Prisma Client (v6.19.3)`

### Step 9 – Create the database and tables (migrations)
```powershell
npm run prisma:migrate
```
Expected: `All migrations have been successfully applied.`
The file **`backend/portfolio.db`** now exists and contains every table
(`Admin`, `Project`, `ProjectMedia`, `PortfolioSettings`, `Message`).

### Step 10 – Add the admin account and the starting data (seed)
```powershell
npm run db:seed
```
Expected (first time):
```
Using SQLite database: C:\Projects\Tapang_Portfolio_SQLite_ORM_Project\backend\portfolio.db
Admin created: andrei (your-real-email@gmail.com)
Portfolio settings ready (the original profile.jpg and resume.pdf are used until you upload new ones).
Sample projects: 3 created, 0 already existed.

Seed finished. Admin accounts: 1. Projects in the database: 3.
```
If something in `.env` is missing or still says `YOUR_...`, the seed stops and tells you exactly which line to fix.

> **Shortcut:** steps 7–10 can also be run with one command: `npm run db:setup`

### Step 11 – Start the backend
```powershell
npm run dev
```
Expected:
```
SQLite database: C:\...\backend\portfolio.db
Server running at http://localhost:3000
Health check:     http://localhost:3000/api/health
```
Open <http://localhost:3000/api/health> in your browser. You should see
`{"status":"ok","database":"sqlite","databaseConnected":true}`.

**Leave this terminal open** – the backend runs as long as it is open. (`npm run dev` restarts automatically
when you edit backend code. Use `npm start` for a normal run without auto-restart.)

---

## 3. First-time setup – frontend (Terminal 2)

Open a **second** terminal: click the **+** icon in the terminal panel (or **Terminal → New Terminal**).
It opens at the project folder again.

```powershell
cd frontend
npm install
npm run dev
```
Expected:
```
VITE v8.x  ready in ... ms
➜  Local:   http://localhost:5173/
```
**Ctrl + click** `http://localhost:5173/` to open your portfolio. 🎉

You do **not** need a `frontend/.env` file when the backend is at `http://localhost:3000`.
(Only if you change the backend port: `Copy-Item .env.example .env` inside `frontend` and edit `VITE_API_BASE_URL`.)

---

## 4. Normal daily startup

After the first setup, every time you open the project you only need **two commands in two terminals**:

**Terminal 1 – backend**
```powershell
cd backend
npm run dev
```
**Terminal 2 – frontend**
```powershell
cd frontend
npm run dev
```
Then open <http://localhost:5173>. To stop a server, click its terminal and press **Ctrl + C**.

You do **not** need to run `migrate` or `seed` every day. Run them again only when:
* you downloaded a newer version of the project that contains new migration folders → `npm run prisma:migrate`
* you changed admin details in `backend/.env` → `npm run db:seed`

---

## 5. Important addresses

| What | Address |
|---|---|
| Portfolio website (frontend) | <http://localhost:5173> |
| Admin Dashboard | <http://localhost:5173/#admin> (or the **Admin** link in the footer) |
| Backend API | <http://localhost:3000> |
| Backend health check | <http://localhost:3000/api/health> |
| Prisma Studio | <http://localhost:5555> (after `npm run prisma:studio`) |

---

## 6. Prisma Studio (view and edit the database)

Prisma Studio replaces phpMyAdmin. Open a **third** terminal:
```powershell
cd backend
npm run prisma:studio
```
Your browser opens <http://localhost:5555>. Click a model on the left (for example **Project** or **Message**)
to see its rows. You can edit a cell, click **Save 1 change**, add records, or delete them.
The backend can keep running at the same time.

Careful:
* Do not edit `passwordHash` in **Admin** by hand. To change the admin password, edit `ADMIN_PASSWORD` in
  `backend/.env` and run `npm run db:seed`.
* Deleting a **ProjectMedia** row in Studio does not delete the file in `backend/uploads/projects/`. Use the
  Admin Dashboard to remove media – it deletes both.

Stop Prisma Studio with **Ctrl + C** in its terminal.

---

## 7. Using the Admin Dashboard

Go to <http://localhost:5173/#admin> and log in with your `ADMIN_USERNAME` (or `ADMIN_EMAIL`) and `ADMIN_PASSWORD`.
There is **no public sign-up page**; the only admin account comes from `backend/.env` via the seed.

* **Overview** – counts of projects and messages.
* **Projects** – *Add project*: title, description, category, tools (comma separated), cover image, additional
  images, an optional MP4 video, optional link, completion date, status (Draft/Published) and display order.
  *Edit* lets you change everything, preview and remove media, and pick the cover. *Publish/Unpublish* toggles
  visibility instantly. Only **Published** projects appear on the public site. *Delete* removes the project,
  its media records (cascade delete) and its files.
* **Profile picture** – choose an image, preview it, save. The hero updates immediately. *Restore original*
  goes back to `frontend/public/profile.jpg`.
* **Resume** – upload a PDF to replace the resume. *View Resume* / *Download PDF* on the site always serve the
  newest one. *Restore original* goes back to `frontend/public/resume.pdf`.
* **Messages** – everything sent from the Contact form. Search, filter by status, open (marks it *Read*),
  write a reply, archive or delete. **Replies are saved in the dashboard only – no email is sent.**

Allowed uploads: JPG, PNG, WEBP images (5 MB), MP4 videos (50 MB), PDF resume (10 MB), up to 10 images per
project. The server checks the real file content, not just the extension. Limits can be changed with the optional
settings at the bottom of `backend/.env`.


---

## 8. All backend commands

Run these inside the `backend` folder.

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-restart on code changes (development). |
| `npm start` | Start the API normally (production style). |
| `npm run prisma:validate` | Check `prisma/schema.prisma` for mistakes. |
| `npm run prisma:generate` | Create/refresh Prisma Client from the schema. |
| `npm run prisma:migrate` | Create `portfolio.db` if needed and apply all migrations (`prisma migrate deploy`). Safe: never deletes data. |
| `npm run prisma:status` | Show whether the database is up to date with the migrations. |
| `npm run db:seed` | Create/update the admin, the settings row and the 3 sample projects. Safe to run many times. |
| `npm run db:seed -- --restore-samples` | Re-create any of the 3 sample projects you deleted (existing ones are never changed). |
| `npm run db:setup` | validate + generate + migrate + seed in one go. |
| `npm run prisma:studio` | Open Prisma Studio at <http://localhost:5555>. |
| `npm run prisma:migrate:dev` | **Only when you change `schema.prisma` yourself:** creates a new migration (`prisma migrate dev --name what-you-changed`). |
| `npm run db:reset` | ⚠️ **Deletes ALL data**, re-creates the tables and seeds again. Prisma asks you to confirm. |

### About the seed
* The admin is matched by username/email – never duplicated. Changing `ADMIN_PASSWORD` (or name/email) in
  `.env` and running the seed again updates the same account.
* The 3 sample projects (from `backend/prisma/seed-data/projects.json`) are added only the first time.
  Projects you **edited** in the dashboard are never overwritten, and samples you **deleted** do not come back
  (unless you use `--restore-samples`).

### If you change the database structure later
1. Edit `backend/prisma/schema.prisma`.
2. Stop the backend (**Ctrl + C**).
3. `npm run prisma:migrate:dev -- --name describe-your-change`
4. Commit the new folder inside `backend/prisma/migrations/` to Git.

---

## 9. Troubleshooting

**PowerShell says "running scripts is disabled on this system" when you run `npm`**
Run this once, then close and reopen the terminal:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
(Or switch the VS Code terminal to **Command Prompt** with the ⌄ arrow next to **+**.)

**Port already in use** – `Port 3000 is already in use` or Vite says `Port 5173 is already in use`
The project is probably already running in another terminal – close it (Ctrl + C) or close the extra
terminal with the 🗑 icon. To find and stop the program using a port:
```powershell
netstat -ano | findstr :3000
taskkill /PID <the number in the last column> /F
```
Or change `PORT` in `backend/.env` **and** set `VITE_API_BASE_URL=http://localhost:NEWPORT` in `frontend/.env`.

**Database file not found** – `Database not ready: The database file was not found at ...`
You have not created the database yet (or deleted `portfolio.db`). In `backend`:
```powershell
npm run prisma:migrate
npm run db:seed
```

**Prisma Client not generated** – `@prisma/client did not initialize yet` or `Cannot find module '.prisma/client'`
```powershell
npm run prisma:generate
```
If it still fails, delete `backend/node_modules`, then run `npm install` and `npm run prisma:generate` again.
On Windows, stop the backend and Prisma Studio first – a running server can lock the Prisma engine file
(error `EPERM: operation not permitted, rename ...query_engine-windows.dll.node`).

**Missing database tables** – `The database is missing these tables`, or error **P2021** "The table ... does not exist"
The migrations were not applied to this database file:
```powershell
npm run prisma:migrate
npm run prisma:status
```
`prisma:status` should say `Database schema is up to date!`. If Prisma reports a *drift* or *failed migration*
on a database you don't need to keep, stop the backend, delete `backend/portfolio.db` (plus `portfolio.db-wal` /
`portfolio.db-shm` if present) and run `npm run db:setup`.

**Missing admin account** – the backend prints `No administrator account yet`, or login says incorrect
```powershell
npm run db:seed
```
Check that it prints `Admin created` or `Admin already up to date`.

**Invalid login credentials** – "Incorrect username/email or password"
* Use the values from `backend/.env`: `ADMIN_USERNAME` **or** `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
* Changed `.env` after seeding? Run `npm run db:seed` again – it updates the password.
* "Too many login attempts" → wait 15 minutes, or restart the backend.

**Upload failures**
* Read the red message in the dashboard: wrong type (only JPG/PNG/WEBP, MP4, PDF) or too large.
* A file renamed to `.jpg` that is really something else is rejected on purpose.
* Make sure the folders `backend/uploads/projects`, `profile` and `resume` exist (the backend creates them
  at startup) and that the project is not in a read-only/synced folder.

**Frontend cannot connect to backend** – "Cannot reach the backend at http://localhost:3000"
* Is Terminal 1 (backend) running and showing `Server running at http://localhost:3000`?
* Open <http://localhost:3000/api/health> – it must show `"status":"ok"`.
* If you changed the port, `frontend/.env` must match, and Vite must be restarted after editing it.
* "This origin is not allowed" / login does nothing → the website must be opened at the address in
  `FRONTEND_ORIGIN` (`http://localhost:5173`). Use `localhost`, not `127.0.0.1`, or add both, comma separated,
  then restart the backend.

**Prisma Studio connection problems**
* Run it **inside the `backend` folder** (it needs `backend/.env` and `prisma/schema.prisma`).
* Run `npm run prisma:migrate` first – Studio cannot show tables that do not exist.
* `Port 5555 is in use` → close the other Studio terminal, or run `npx prisma studio --port 5556`.
* "database is locked" → wait a second and retry; if it persists, stop the backend, save in Studio, restart.

**A database viewer extension shows 0 rows, but the dashboard shows the data**
Viewers don't refresh by themselves: close the `portfolio.db` tab and open it again. Prisma Studio
(`npm run prisma:studio`) always shows the live data.

**`npm run prisma:...` prints nothing and does nothing**
The backend scripts already call Prisma through `node ./node_modules/prisma/build/index.js` to avoid this. If
you still see it, run the command directly, for example `node node_modules/prisma/build/index.js generate`, and
reinstall with `Remove-Item -Recurse -Force node_modules` then `npm install`.

**`npm audit` warnings in the backend**
They come from Prisma's command-line tool (used only on your computer). **Do not run `npm audit fix --force`** –
it would upgrade to Prisma 7, which this project does not use.

**Starting over completely** (deletes all data and uploads):
stop both servers, delete `backend/portfolio.db*` and the files inside `backend/uploads/*/` (keep `.gitkeep`),
then run `npm run db:setup` in `backend`.

---

## 10. How the database works

* **Getting an update with new migrations?** Stop the backend, then in `backend` run `npm run prisma:generate` and
  `npm run prisma:migrate`. The server refuses to start (with a clear message) until the database is up to date.
* **One file:** `backend/portfolio.db`. Back it up by stopping the backend and copying the file.
  Every change is written straight into this file, so you can also look at it with a VS Code database viewer
  (for example the *Database Client* extension). Close and reopen the viewer tab to see new rows.
* **Schema:** `backend/prisma/schema.prisma` – models `Admin`, `Project`, `ProjectMedia`, `PortfolioSettings`,
  `Message` and the enums `ProjectStatus` (DRAFT, PUBLISHED), `MediaType` (IMAGE, VIDEO),
  `MessageStatus` (PENDING, READ, REPLIED, ARCHIVED).
* **Migrations:** `backend/prisma/migrations/` – the SQL that builds the tables. `migration_lock.toml` says
  `provider = "sqlite"`.
* **Files are not stored in the database.** Images, videos and PDFs are saved in `backend/uploads/projects`,
  `backend/uploads/profile`, `backend/uploads/resume` with random safe names; the database stores only their
  metadata (original name, type, size, path).
* Deleting a project automatically deletes its `ProjectMedia` rows (`ON DELETE CASCADE`).
* `Project.completionDate` is saved as plain text in the form `YYYY-MM-DD` (for example `2026-11-09`), exactly
  the day you pick in the dashboard, so it reads clearly in any database viewer and never shifts by a day.
* **All other dates** (`createdAt`, `updatedAt`, `repliedAt`, `uploadedAt`, …) are saved as readable **Philippine time**
  text, for example `2026-11-10 22:30:15`. New rows get the time automatically; `updatedAt` changes whenever the record
  is edited. (Only Prisma's own `_prisma_migrations` table still shows numbers – Prisma manages that table itself.)
* **IDs have no gaps.** A new project or message gets the smallest free number: with IDs 1–4, deleting ID 2 and adding
  a new project gives it ID 2 again; deleting the last one and adding again reuses that number too.
* The `PortfolioSettings` table has exactly one row (`id = 1`). Empty file fields mean "use the original
  `profile.jpg` / `resume.pdf` from `frontend/public`".

### What changed from the old MySQL/XAMPP version
* `provider = "mysql"` → `provider = "sqlite"`; `DATABASE_URL="file:../portfolio.db"`.
* MySQL-only column types (`@db.VarChar`, `@db.Text`, `@db.Date`) were removed (SQLite doesn't use them). The
  same maximum lengths are still enforced by the API's validation.
* The old MySQL migrations were removed and replaced by **one fresh SQLite migration**
  (`..._init_sqlite`) generated by Prisma itself and tested.
* The server and the seed now check that the database file and every table exist **before** running, and print
  a clear instruction instead of Prisma errors such as P2021.
* **Your old MySQL data is not copied automatically.** The 3 sample projects come back through the seed. If you
  had added other projects or messages in the XAMPP version, re-create them in the dashboard (or copy
  them across in Prisma Studio).

---

## 11. GitHub

GitHub stores your **source code**. It is **not** a database server: it cannot run the Express API, and it
does not "sync" a live SQLite database. That is why `portfolio.db`, `.env` and uploaded files are git-ignored –
anyone who clones the repository creates their **own** database with `npm run prisma:migrate` and `npm run db:seed`.

What **is** committed: all code, `schema.prisma`, the `migrations` folder, `seed.js`, `seed-data/projects.json`,
`.env.example` files, `package.json` / `package-lock.json`, the `uploads/*/.gitkeep` placeholders and this README.

Before your first commit, check that no private file is included:
```powershell
git init
git status
```
`.env`, `portfolio.db`, `node_modules` and uploaded files must **not** appear in the list. Then:
```powershell
git add .
git commit -m "Portfolio with React, Express, Prisma ORM and SQLite"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

---

## 12. Deploying online later

This project is set up for **local** use. Putting it online needs more than GitHub:

* **GitHub Pages** can host only the built React files (`frontend/dist`). It **cannot** run the Express backend
  or a database, so the dashboard, projects and contact form would not work there by themselves.
* The **backend** needs a Node.js host (for example Render, Railway, Fly.io or a VPS).
* **SQLite on a host** works only with a **persistent disk/volume** for `portfolio.db` **and** for
  `backend/uploads/`. Many free hosts wipe files on every restart or deploy – you would lose data and uploads.
  The alternative is a hosted database (for example PostgreSQL on Supabase or Neon): change the Prisma
  `provider`, create new migrations for it, and store uploads in object storage (for example Cloudinary or S3).
* For production also set `NODE_ENV=production`, use HTTPS, set `FRONTEND_ORIGIN` to the real site address,
  and keep the admin password strong.

---

## 13. Project structure, API and security

```
Tapang_Portfolio_SQLite_ORM_Project/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma            ← SQLite schema (models + enums)
│  │  ├─ migrations/              ← SQLite migration SQL + migration_lock.toml
│  │  ├─ seed.js                  ← admin + settings + sample projects (idempotent)
│  │  └─ seed-data/projects.json  ← the 3 original projects
│  ├─ src/
│  │  ├─ config.js                ← reads .env, resolves the SQLite file path
│  │  ├─ middleware/              ← auth (JWT cookie), uploads (multer), errors
│  │  ├─ routes/                  ← auth, projects, adminProjects, settings, messages
│  │  └─ utils/                   ← validation, file type detection, storage, dbCheck
│  ├─ uploads/{projects,profile,resume}/   ← uploaded files (git-ignored)
│  ├─ prisma.js                   ← the single Prisma Client instance
│  ├─ server.js                   ← Express app + startup checks
│  ├─ .env.example                ← copy to .env
│  └─ portfolio.db                ← created by "npm run prisma:migrate" (git-ignored)
└─ frontend/
   ├─ public/                     ← profile.jpg, resume.pdf, favicon.svg (originals)
   ├─ src/
   │  ├─ components/              ← Hero, About, Skills, Projects, Education, Resume, Achievements, Contact, …
   │  │  ├─ admin/                ← Admin login + dashboard screens
   │  ├─ services/                ← api.js, portfolioService, adminService
   │  ├─ context/ hooks/ pages/ styles/ utils/ data/
   └─ .env.example
```

### API overview
* **Public:** `GET /api/health`, `GET /api/projects`, `GET /api/projects/:id`, `GET /api/settings`,
  `GET /api/settings/resume/file[?download=1]`, `POST /api/messages`
* **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`, `GET /api/auth/me`
* **Admin (login cookie required):** `/api/admin/projects` (GET, POST, PUT `/:id`, PATCH `/:id/status`, DELETE `/:id`),
  `/api/admin/settings` (GET, PUT/DELETE `profile-image`, PUT/DELETE `resume`),
  `/api/admin/messages` (GET `?search=&status=`, GET `/:id`, PATCH `/:id/status`, PATCH `/:id/reply`, DELETE `/:id`)

### Security notes
* Passwords are bcrypt-hashed (cost 12). The login token (JWT) is kept in an **HttpOnly, SameSite=Lax** cookie –
  never in localStorage. Login is rate-limited.
* Changing admin data needs the cookie **and** an `X-Requested-With` header from an allowed origin (CSRF defence).
* Uploads are checked by their real bytes, size-limited, given random names, and validated before anything is
  written. The contact form has validation, a spam trap and a rate limit (5 messages per 15 minutes).
* The contact email in `frontend/src/data/portfolioData.js` is a placeholder and stays hidden until you set a real
  `email` and `isPlaceholder: false`.
