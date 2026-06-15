# DairyMind™ — Çiftlik Anketi Web App

Turkish farm onboarding survey for the DairyMind digital twin project. 14 sections, 261 questions. Auto-save, mobile friendly, modern UI. Built to deploy on Hostinger (or any Node.js host) without a build step.

## Stack

- **Backend:** Node.js (Express)
- **DB:** SQLite (`better-sqlite3`) — single file, zero config
- **Frontend:** Vanilla HTML + Tailwind CSS (CDN) + Alpine.js — no build step
- **Data source:** `../DairyMind Cifftlik Anketi.xlsx` extracted to `data/questions.json`

## Run locally

```bash
cd anket-app
npm install
npm start
# → http://localhost:3000
# Admin → http://localhost:3000/admin
```

Admin token: set via `ADMIN_TOKEN` env var. In dev a random token is generated and printed to the console on boot. In production (`NODE_ENV=production`) the server **refuses to start** without `ADMIN_TOKEN`. Never commit a token to the repo. See `DEPLOY.md`.

For dev with auto-reload:
```bash
npm run dev
```

## Re-extract questions from xlsx

If you update the xlsx, re-run extraction (requires Python + openpyxl):

```bash
pip install openpyxl
python scripts/extract.py
```

## Project structure

```
anket-app/
├── server.js              # Express + SQLite + API
├── package.json
├── data/questions.json    # 14 sections / 261 questions
├── scripts/extract.py     # xlsx → json converter
├── views/
│   ├── index.html         # landing + start form
│   ├── anket.html         # main survey SPA (Alpine.js)
│   ├── tamamlandi.html    # thank-you page
│   └── admin.html         # admin dashboard + export
├── public/style.css       # tiny custom CSS (scrollbar, x-cloak)
└── db/anket.db            # SQLite (auto-created on first run)
```

## API

| Method | Path                                | Purpose                       |
|--------|-------------------------------------|-------------------------------|
| GET    | `/`                                 | Landing                       |
| GET    | `/anket/:id`                        | Survey wizard                 |
| GET    | `/tamamlandi/:id`                   | Thank-you page                |
| GET    | `/admin`                            | Admin dashboard               |
| GET    | `/api/questions`                    | Full question schema (JSON)   |
| POST   | `/api/submissions`                  | Create submission             |
| GET    | `/api/submissions/:id`              | Load submission + answers     |
| POST   | `/api/submissions/:id/answers`      | Upsert one or many answers    |
| POST   | `/api/submissions/:id/complete`     | Mark completed                |
| GET    | `/api/admin/submissions?token=...`  | List all submissions (admin)  |
| GET    | `/api/admin/export?token=...`       | Download all answers as JSON  |
| GET    | `/api/admin/export.csv?token=...`   | Download all answers as CSV   |

## Configuration

| Env var       | Default                      | Notes                                              |
|---------------|------------------------------|----------------------------------------------------|
| `PORT`        | `3000`                       | HTTP port                                          |
| `NODE_ENV`    | —                            | Set `production` on deploy                          |
| `ADMIN_TOKEN` | random (dev only, logged)    | **Required in production** — server refuses to start without it. Dev generates a random one and prints it to the console. |

## Question types supported

The extractor maps `Yanıt Tipi` (xlsx column) to widgets:

| Yanıt Tipi   | Widget                                             |
|--------------|----------------------------------------------------|
| Sayı         | Number input (with unit suffix from "Seçenekler")  |
| Metin        | Text input (placeholder from "Seçenekler")         |
| Tek seçim    | Radio buttons (if "/"-separated options parseable) |
| Tek seçim    | Text input (if no clear options)                   |
| Çoklu        | Checkboxes (if options parseable)                  |
| Çoklu        | Text input (if no clear options)                   |

For "Tek seçim" / "Çoklu" rows where the xlsx left the "Seçenekler" cell empty or non-parseable, the field falls back to a text input. Improve by editing `data/questions.json` directly (look for `"type": "select_text"` or `"multi_text"`) and adding `"options": ["A","B","C"]` + change type to `"radio"` / `"checkbox"`.

## Auto-save behavior

- Every answer triggers a 600 ms debounced POST to `/api/submissions/:id/answers`.
- Section navigation flushes pending saves first.
- Browser localStorage remembers the active section and submission id, so closing the tab and returning resumes where the farmer left off.
- DB has `UNIQUE(submission_id, question_id)`, so answers are upserted (no duplicates).

## Deploy to Hostinger (Node.js hosting)

1. **Create a Node.js application** in hPanel → "Websites" → your domain → "Node.js".
2. **Node version:** select 18 or 20 (LTS).
3. **Startup file:** `server.js`
4. **Application root:** `/anket-app` (or wherever you upload).
5. **Upload files** via File Manager / SFTP / Git.
6. SSH in and run:
   ```bash
   npm install --omit=dev
   ```
   (`better-sqlite3` is native — Hostinger build servers will compile it.)
7. Set env vars in hPanel: `ADMIN_TOKEN=<something-strong>`.
8. Restart the app.

The SQLite DB lives in `db/anket.db` next to `server.js`. Back it up periodically (just copy the file). To reset, stop the app, delete `db/anket.db*`, restart.

## Sharing with farmers

Just send them the root URL:

```
https://yourdomain.com/
```

They fill name/farm/phone → get redirected to `/anket/<id>` → answer in any order → close tab → return later (same browser) → "Devam et" button restores their session.

To send each farmer a personalised pre-filled link later, you can extend `/api/submissions` to accept a pre-set id and metadata.

## Data export

From `/admin`:

- **JSON Export:** full structure with all answers per submission. Best for re-importing or feeding to ML.
- **CSV Export:** one row per answer (long format). Best for Excel inspection.

Both endpoints support `?token=...` query auth so they work directly from the browser.

## Known limitations

- Tailwind via CDN: fine for prototype, switch to compiled build for prod (smaller payload).
- No CSRF protection: low risk for an internal survey, but worth adding for public deploy.
- Admin token is single-shared-secret. Move to per-user auth before serious scale.
- Options for some "Tek seçim" questions are empty in the xlsx — those render as text inputs. Iterate on `data/questions.json` to enrich.
- No file/photo upload yet — text/number only.

## Next iterations to consider

- Per-farm pre-generated links (`/f/abc123`) so farmers don't enter contact info again.
- WhatsApp deep-link share button on admin: "Send link to farmer".
- Validation rules per question (min/max for numbers, regex for phone).
- Export to xlsx (not just csv) using `exceljs`.
- Question-level "skip if" logic (e.g., hide milk meter sub-questions if `7.13 = Hayır`).

---

Built with Claude (caveman mode 🐾) for the DairyMind project.
