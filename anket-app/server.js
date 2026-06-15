/**
 * DairyMind Çiftlik Anketi — Express server
 * Stack: Node 22+ (node:sqlite), Express, self-hosted Tailwind/Alpine frontend.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'db', 'anket.db');
const CONSENT_VERSION = 'kvkk-v1-2026';

// ---------- Admin token (no secret baked into source) ----------
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
if (!ADMIN_TOKEN) {
  if (NODE_ENV === 'production') {
    console.error('FATAL: ADMIN_TOKEN env var is required in production. Refusing to start.');
    process.exit(1);
  }
  // Dev convenience: generate an ephemeral token, print it once.
  ADMIN_TOKEN = crypto.randomBytes(12).toString('base64url');
  console.warn(`⚠ DEV admin token (set ADMIN_TOKEN to override): ${ADMIN_TOKEN}`);
}

// Constant-time token compare to avoid timing leaks
function tokenEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ba = Buffer.from(a), bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
function newAccessToken() { return crypto.randomBytes(24).toString('base64url'); } // ~32 chars, unguessable

// ---------- DB ----------
fs.mkdirSync(path.join(ROOT, 'db'), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  section_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  question_no TEXT,
  question_text TEXT,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(submission_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_submission ON answers(submission_id);

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otp_codes (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone);
`);

// ---------- Lightweight migrations (additive, idempotent) ----------
function ensureColumn(table, col, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some(c => c.name === col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
  }
}
ensureColumn('submissions', 'access_token', 'TEXT');     // per-submission bearer secret
ensureColumn('submissions', 'consent_at', 'TEXT');        // KVKK consent timestamp
ensureColumn('submissions', 'consent_version', 'TEXT');   // which consent text version

// Backfill access_token for any pre-existing rows (one-time)
{
  const missing = db.prepare("SELECT id FROM submissions WHERE access_token IS NULL OR access_token = ''").all();
  if (missing.length) {
    const upd = db.prepare('UPDATE submissions SET access_token = ? WHERE id = ?');
    for (const m of missing) upd.run(newAccessToken(), m.id);
    console.log(`Migration: backfilled access_token for ${missing.length} submission(s).`);
  }
}

// ---------- Questions + Provinces ----------
const QUESTIONS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf-8')
);
const PROVINCES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'turkey-provinces.json'), 'utf-8')
);
// Allowlist of valid question IDs (reject anything not in the survey)
const VALID_QIDS = new Set();
for (const sec of (QUESTIONS.sections || [])) {
  for (const q of (sec.questions || [])) VALID_QIDS.add(q.id);
}

// ---------- App ----------
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '512kb' }));

// Security headers + CSP (self-hosted assets → strict-ish; inline allowed for Alpine/Tailwind config)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Alpine uses eval; Tailwind config inline
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'self'"
  ].join('; '));
  next();
});

// ---------- In-memory rate limiter (single-instance; resets on restart) ----------
const rlBuckets = new Map(); // key -> { count, resetAt }
function rateLimit({ windowMs, max, key }) {
  return (req, res, next) => {
    const k = (key ? key(req) : req.ip) + ':' + req.path;
    const now = Date.now();
    let b = rlBuckets.get(k);
    if (!b || now > b.resetAt) { b = { count: 0, resetAt: now + windowMs }; rlBuckets.set(k, b); }
    b.count++;
    if (b.count > max) {
      const retry = Math.ceil((b.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({ error: `Çok fazla istek. ${retry} saniye sonra tekrar deneyin.` });
    }
    next();
  };
}
// Periodic cleanup so the map can't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of rlBuckets) if (now > b.resetAt) rlBuckets.delete(k);
}, 5 * 60 * 1000).unref();

const limitWrite   = rateLimit({ windowMs: 60_000, max: 120 });             // generic per-IP writes
const limitCreate  = rateLimit({ windowMs: 60_000, max: 5 });               // new submissions: 5/min/IP
const limitOtpReq  = rateLimit({ windowMs: 60_000, max: 4 });               // OTP requests
const limitOtpVer  = rateLimit({ windowMs: 60_000, max: 10 });              // OTP verify
const limitAdmin   = rateLimit({ windowMs: 60_000, max: 30 });

// Farm-engine bundle FIRST (no-cache) so rebuilds are picked up immediately —
// must precede the global public/ static which would otherwise apply 7d cache.
app.use('/farm-engine', express.static(path.join(ROOT, 'public/farm-engine'), {
  etag: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache')
}));

app.use(express.static(path.join(ROOT, 'public'), { maxAge: NODE_ENV === 'production' ? '7d' : 0 }));

// Health check (also pings DB)
app.get('/healthz', (req, res) => {
  try { db.prepare('SELECT 1').get(); res.json({ ok: true, db: true, time: new Date().toISOString() }); }
  catch (e) { res.status(503).json({ ok: false, db: false }); }
});

// Concept demo pages (visual digital twin builder)
app.get('/concept-a', (req, res) => res.sendFile(path.join(ROOT, 'views', 'concept-a.html')));
app.get('/concept-b', (req, res) => res.sendFile(path.join(ROOT, 'views', 'concept-b.html')));
app.get('/concept-hybrid', (req, res) => res.sendFile(path.join(ROOT, 'views', 'concept-hybrid.html')));

// Legacy dev sandbox (vanilla SVG, will be retired)
app.get('/preview-legacy', (req, res) => res.sendFile(path.join(ROOT, 'views', 'preview.html')));

// New Vue 3 farm-engine playground (SPA build, served from public/preview)
app.use('/preview', express.static(path.join(ROOT, 'public/preview')));

// Layout editor (admin) — drag-place farm objects
app.get('/yerlesim', (req, res) => res.sendFile(path.join(ROOT, 'views', 'yerlesim.html')));

// Full-screen digital twin view for a specific submission
app.get('/cifligim/:id', (req, res) => {
  const sub = db.prepare('SELECT id FROM submissions WHERE id = ?').get(req.params.id);
  if (!sub) return res.redirect('/');
  res.sendFile(path.join(ROOT, 'views', 'cifligim.html'));
});

// Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'index.html'));
});

app.get('/anket/:id', (req, res) => {
  const sub = db.prepare('SELECT id FROM submissions WHERE id = ?').get(req.params.id);
  if (!sub) return res.redirect('/');
  res.sendFile(path.join(ROOT, 'views', 'anket.html'));
});

app.get('/tamamlandi/:id', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'tamamlandi.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'admin.html'));
});

// ---------- API ----------
app.get('/api/questions', (req, res) => {
  res.json(QUESTIONS);
});

app.get('/api/provinces', (req, res) => {
  res.json(PROVINCES);
});

// ---------- Farm layout (global config) ----------
const getConfig = db.prepare('SELECT value FROM app_config WHERE key = ?');
const setConfig = db.prepare(`
  INSERT INTO app_config (key, value, updated_at) VALUES (?, ?, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
`);

// Public: any farmer page fetches the saved layout
app.get('/api/layout', (req, res) => {
  const row = getConfig.get('farm_layout');
  if (!row) return res.json({ layout: null });
  try { res.json({ layout: JSON.parse(row.value) }); }
  catch { res.json({ layout: null }); }
});

// Admin: save layout (zone -> {x,y})
app.post('/api/layout', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' });
  const layout = req.body && req.body.layout;
  if (!layout || typeof layout !== 'object') {
    return res.status(400).json({ error: 'layout objesi gerekli' });
  }
  // Sanitize: only numeric x/y per key
  const clean = {};
  for (const [k, v] of Object.entries(layout)) {
    if (v && typeof v === 'object' && isFinite(Number(v.x)) && isFinite(Number(v.y))) {
      clean[k] = { x: Math.round(Number(v.x)), y: Math.round(Number(v.y)) };
    }
  }
  setConfig.run('farm_layout', JSON.stringify(clean));
  res.json({ ok: true, count: Object.keys(clean).length });
});

// ---------- Server-side input cleaners ----------
function cleanPhoneTR(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('90')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('5')) d = '0' + d;
  return /^05\d{9}$/.test(d) ? d : '';
}
function cleanName(raw, min = 2, max = 80) {
  if (typeof raw !== 'string') return '';
  const s = raw.trim().replace(/\s+/g, ' ');
  if (s.length < min || s.length > max) return '';
  // Block obviously bogus single-char repeats and non-letter strings
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(s)) return '';
  return s;
}
const PROVINCE_NAMES = new Set(PROVINCES.provinces.map(p => p.name));

// Neutralize CSV/spreadsheet formula injection (=, +, -, @, tab, CR lead chars)
function csvSafe(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

// Is the request authorized as admin?
function isAdmin(req) {
  const token = req.headers['x-admin-token'] || req.query.token;
  return tokenEqual(String(token || ''), ADMIN_TOKEN);
}

// Ownership guard: admin OR a valid per-submission access_token (header x-access-token or ?t=).
// Loads the submission row onto req.submission.
function requireOwner(req, res, next) {
  const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!sub) return res.status(404).json({ error: 'not found' });
  const supplied = String(req.headers['x-access-token'] || req.query.t || '');
  const ok = isAdmin(req) || (sub.access_token && tokenEqual(supplied, sub.access_token));
  if (!ok) return res.status(403).json({ error: 'Erişim reddedildi' });
  req.submission = sub;
  next();
}

// Public self-signup is DISABLED — farms are onboarded via admin invite (magic link) only.
// Kept admin-gated so an authenticated admin can still create directly if needed.
app.post('/api/submissions', limitCreate, checkAdmin, (req, res) => {
  const { farmer_name, farm_name, phone, city, consent } = req.body || {};

  const cleanFarmer = cleanName(farmer_name, 2, 80);
  if (!cleanFarmer) return res.status(400).json({ error: 'Geçerli ad-soyad giriniz (en az 2 harf)' });

  const cleanFarm = cleanName(farm_name, 2, 100);
  if (!cleanFarm) return res.status(400).json({ error: 'Geçerli çiftlik adı giriniz (en az 2 karakter)' });

  const cleanPhone = cleanPhoneTR(phone);
  if (!cleanPhone) return res.status(400).json({ error: 'Geçersiz telefon numarası. 05XX XXX XX XX formatında giriniz.' });

  // KVKK: explicit consent is mandatory to store personal data
  if (consent !== true) {
    return res.status(400).json({ error: 'Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.' });
  }

  let cleanCity = '';
  if (city && String(city).trim()) {
    const c = String(city).trim();
    if (!PROVINCE_NAMES.has(c)) {
      return res.status(400).json({ error: `Geçersiz il: "${c}". Listeden seçiniz.` });
    }
    cleanCity = c;
  }

  const id = nanoid(14);                 // longer id (was 10) — harder to enumerate
  const accessToken = newAccessToken();  // bearer secret returned once to the creator
  db.prepare(`
    INSERT INTO submissions (id, farmer_name, farm_name, phone, city, user_agent, access_token, consent_at, consent_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
  `).run(id, cleanFarmer, cleanFarm, cleanPhone, cleanCity, req.headers['user-agent'] || '', accessToken, CONSENT_VERSION);
  res.json({ id, access_token: accessToken, farmer_name: cleanFarmer, farm_name: cleanFarm, phone: cleanPhone });
});

// ---------- Resume via OTP (no more open phone→data lookup) ----------
const otpUpsert = db.prepare(`
  INSERT INTO otp_codes (phone, code, submission_id, expires_at, attempts, created_at)
  VALUES (?, ?, ?, ?, 0, ?)
  ON CONFLICT(phone) DO UPDATE SET
    code = excluded.code, submission_id = excluded.submission_id,
    expires_at = excluded.expires_at, attempts = 0, created_at = excluded.created_at
`);

// Step 1: request a 6-digit code for a phone that has a submission.
// Always returns 200 (no enumeration); code delivered via SMS in prod.
app.post('/api/resume/request', limitOtpReq, (req, res) => {
  const cleanPhone = cleanPhoneTR(req.body && req.body.phone);
  if (!cleanPhone) {
    return res.status(400).json({ error: 'Geçersiz telefon. 05XX XXX XX XX formatında giriniz.' });
  }
  const sub = db.prepare(
    'SELECT id FROM submissions WHERE phone = ? ORDER BY started_at DESC LIMIT 1'
  ).get(cleanPhone);

  const resp = { ok: true, message: 'Telefonunuza bir kod gönderildi (varsa kayıt).' };
  if (sub) {
    const code = String(crypto.randomInt(100000, 1000000)); // 6 digits
    const expiresAt = Date.now() + 10 * 60 * 1000;          // 10 min
    otpUpsert.run(cleanPhone, code, sub.id, expiresAt, Date.now());
    // TODO(prod): send `code` via SMS gateway (Netgsm/İletimerkezi/Twilio).
    // Until SMS is wired, surface the code in dev OR via admin so testing works:
    if (NODE_ENV !== 'production') resp.dev_code = code;
    console.log(`[OTP] phone=${cleanPhone} code=${code} (submission ${sub.id})`);
  }
  res.json(resp); // identical shape whether or not a submission exists
});

// Step 2: verify code → return submission id + access_token
app.post('/api/resume/verify', limitOtpVer, (req, res) => {
  const cleanPhone = cleanPhoneTR(req.body && req.body.phone);
  const code = String((req.body && req.body.code) || '').trim();
  if (!cleanPhone || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Telefon ve 6 haneli kod gerekli.' });
  }
  const row = db.prepare('SELECT * FROM otp_codes WHERE phone = ?').get(cleanPhone);
  if (!row) return res.status(400).json({ error: 'Kod bulunamadı. Yeni kod isteyin.' });
  if (Date.now() > row.expires_at) {
    db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(cleanPhone);
    return res.status(400).json({ error: 'Kodun süresi doldu. Yeni kod isteyin.' });
  }
  if (row.attempts >= 5) {
    db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(cleanPhone);
    return res.status(429).json({ error: 'Çok fazla yanlış deneme. Yeni kod isteyin.' });
  }
  if (!tokenEqual(code, row.code)) {
    db.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = ?').run(cleanPhone);
    return res.status(400).json({ error: 'Kod hatalı.' });
  }
  // Success → consume code, return access credentials
  db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(cleanPhone);
  const sub = db.prepare(
    'SELECT id, farmer_name, farm_name, access_token, started_at, updated_at, completed_at FROM submissions WHERE id = ?'
  ).get(row.submission_id);
  if (!sub) return res.status(404).json({ error: 'Anket bulunamadı.' });
  const ac = db.prepare('SELECT COUNT(*) AS n FROM answers WHERE submission_id = ?').get(sub.id);
  res.json({
    id: sub.id, access_token: sub.access_token,
    farmer_name: sub.farmer_name, farm_name: sub.farm_name,
    answer_count: ac.n, started_at: sub.started_at,
    updated_at: sub.updated_at, completed_at: sub.completed_at
  });
});

// Read a submission — requires owner access_token or admin
app.get('/api/submissions/:id', requireOwner, (req, res) => {
  const sub = req.submission;
  const answers = db.prepare('SELECT question_id, value FROM answers WHERE submission_id = ?').all(sub.id);
  const map = {};
  for (const a of answers) {
    try { map[a.question_id] = JSON.parse(a.value); }
    catch { map[a.question_id] = a.value; }
  }
  // Never leak the access_token back in reads
  const { access_token, ...safeSub } = sub;
  // needs_consent: invite-created rows have no consent_at until the farmer accepts KVKK
  res.json({ submission: safeSub, answers: map, needs_consent: !sub.consent_at });
});

const upsertAnswer = db.prepare(`
  INSERT INTO answers (submission_id, section_id, question_id, question_no, question_text, value, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(submission_id, question_id) DO UPDATE SET
    value = excluded.value,
    updated_at = datetime('now')
`);
const touchSubmission = db.prepare(`UPDATE submissions SET updated_at = datetime('now') WHERE id = ?`);

app.post('/api/submissions/:id/answers', limitWrite, requireOwner, (req, res, next) => {
  // KVKK: no survey data is stored until the farmer has accepted consent.
  if (!req.submission.consent_at) return res.status(409).json({ error: 'KVKK onayı gerekli', needs_consent: true });
  let items = Array.isArray(req.body) ? req.body : [req.body];
  if (items.length > 300) items = items.slice(0, 300); // cap batch size
  try {
    db.exec('BEGIN');
    for (const r of items) {
      if (!r || !r.question_id) continue;
      if (!VALID_QIDS.has(r.question_id)) continue; // reject unknown question ids
      let val = JSON.stringify(r.value ?? null);
      if (val.length > 5000) val = JSON.stringify(String(r.value).slice(0, 2000)); // cap value size
      upsertAnswer.run(
        req.submission.id,
        r.section_id ?? 0,
        r.question_id,
        String(r.question_no || '').slice(0, 16),
        String(r.question_text || '').slice(0, 300),
        val
      );
    }
    touchSubmission.run(req.submission.id);
    db.exec('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    try { db.exec('ROLLBACK'); } catch {}
    next(e);
  }
});

app.post('/api/submissions/:id/complete', limitWrite, requireOwner, (req, res) => {
  db.prepare(`UPDATE submissions SET completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(req.submission.id);
  res.json({ ok: true });
});

// KVKK: farmer accepts consent on first open of an invite link.
// Recorded once (first acceptance timestamp kept); idempotent thereafter.
app.post('/api/submissions/:id/consent', limitWrite, requireOwner, (req, res) => {
  if (!req.body || req.body.consent !== true) {
    return res.status(400).json({ error: 'KVKK onayı gerekli' });
  }
  if (!req.submission.consent_at) {
    db.prepare(`UPDATE submissions SET consent_at = datetime('now'), consent_version = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(CONSENT_VERSION, req.submission.id);
  }
  res.json({ ok: true });
});

// ---------- Admin ----------
function checkAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// Admin pre-creates a survey for a known farm and gets a magic link to send.
// consent_at is left NULL on purpose — the farmer accepts KVKK on first open.
app.post('/api/admin/invite', limitAdmin, checkAdmin, (req, res) => {
  const { farmer_name, farm_name, phone } = req.body || {};
  const cleanFarmer = cleanName(farmer_name, 2, 80);
  if (!cleanFarmer) return res.status(400).json({ error: 'Geçerli ad-soyad giriniz (en az 2 harf)' });
  const cleanFarm = cleanName(farm_name, 2, 100);
  if (!cleanFarm) return res.status(400).json({ error: 'Geçerli çiftlik adı giriniz (en az 2 karakter)' });
  const cleanPhone = cleanPhoneTR(phone);
  if (!cleanPhone) return res.status(400).json({ error: 'Geçersiz telefon numarası. 05XX XXX XX XX formatında giriniz.' });

  const id = nanoid(14);
  const accessToken = newAccessToken();
  db.prepare(`
    INSERT INTO submissions (id, farmer_name, farm_name, phone, user_agent, access_token)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, cleanFarmer, cleanFarm, cleanPhone, 'admin-invite', accessToken);
  res.json({ id, access_token: accessToken, farmer_name: cleanFarmer, farm_name: cleanFarm, phone: cleanPhone });
});

app.get('/api/admin/submissions', limitAdmin, checkAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM answers a WHERE a.submission_id = s.id) AS answer_count
    FROM submissions s
    ORDER BY s.updated_at DESC
  `).all();
  res.json({ total: rows.length, submissions: rows });
});

app.get('/api/admin/export', checkAdmin, (req, res) => {
  const subs = db.prepare('SELECT * FROM submissions ORDER BY started_at').all();
  const ans = db.prepare('SELECT * FROM answers ORDER BY submission_id, section_id').all();
  const grouped = {};
  for (const a of ans) {
    if (!grouped[a.submission_id]) grouped[a.submission_id] = [];
    try { a.value = JSON.parse(a.value); } catch {}
    grouped[a.submission_id].push(a);
  }
  // Strip the per-submission secret from the downloadable export (it may be shared)
  const out = subs.map(s => {
    const { access_token, ...rest } = s;
    return { ...rest, answers: grouped[s.id] || [] };
  });
  res.setHeader('Content-Disposition', `attachment; filename="anket-export-${new Date().toISOString().slice(0,10)}.json"`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify({ exported_at: new Date().toISOString(), total: out.length, data: out }, null, 2));
});

app.get('/api/admin/export.csv', limitAdmin, checkAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.farmer_name, s.farm_name, s.phone, s.city, s.started_at, s.completed_at,
           a.section_id, a.question_no, a.question_text, a.value
    FROM submissions s
    LEFT JOIN answers a ON a.submission_id = s.id
    ORDER BY s.started_at, a.section_id, a.question_no
  `).all();
  const header = ['submission_id','farmer_name','farm_name','phone','city','started_at','completed_at','section_id','question_no','question_text','value'];
  const lines = [header.join(',')];
  for (const r of rows) {
    let val = r.value;
    try { val = JSON.parse(val); if (Array.isArray(val)) val = val.join(' | '); } catch {}
    lines.push([r.id, r.farmer_name, r.farm_name, r.phone, r.city, r.started_at, r.completed_at, r.section_id, r.question_no, r.question_text, val].map(csvSafe).join(','));
  }
  res.setHeader('Content-Disposition', `attachment; filename="anket-export-${new Date().toISOString().slice(0,10)}.csv"`);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send('﻿' + lines.join('\n'));
});

// KVKK: erase a submission (admin, or owner with access token) — CASCADE removes answers
app.delete('/api/submissions/:id', limitWrite, requireOwner, (req, res) => {
  db.prepare('DELETE FROM submissions WHERE id = ?').run(req.submission.id);
  db.prepare('DELETE FROM otp_codes WHERE submission_id = ?').run(req.submission.id);
  res.json({ ok: true, deleted: req.submission.id });
});

// ---------- 404 for unknown API routes ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'not found' }));

// ---------- Central error handler ----------
app.use((err, req, res, next) => {
  console.error('[ERROR]', req.method, req.path, '-', err && err.message);
  if (res.headersSent) return next(err);
  const msg = NODE_ENV === 'production' ? 'Sunucu hatası' : (err && err.message) || 'error';
  res.status(500).json({ error: msg });
});

const server = app.listen(PORT, () => {
  console.log(`🐄 DairyMind Anket running on port ${PORT}`);
  console.log(`   Mode: ${NODE_ENV}`);
});

// ---------- Crash safety + graceful shutdown ----------
process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));

let shuttingDown = false;
function shutdown(sig) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${sig} received — shutting down...`);
  server.close(() => {
    try { db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
    console.log('Closed cleanly.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref(); // force-exit fallback
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
