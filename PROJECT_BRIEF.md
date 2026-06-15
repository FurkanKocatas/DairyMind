# DairyMind — Project Brief & Handoff Document

> **Purpose:** Complete context for resuming work on another machine. Hand this file + the two xlsx files (`DairyMind Parametre Katalogu.xlsx`, `DairyMind Cifftlik Anketi.xlsx`) to Claude on the new machine. Everything needed to continue prototype work is here.

---

## 0. TL;DR

- **What:** Digital twin SaaS for Turkish small-to-mid dairy farms (10–500 head).
- **Output to farmer:** "Yesterday 1,420 L milked. Cow A12 → cull. Cow B07 → dry off. Cow C22 → inseminate today." Plain Turkish, WhatsApp / mobile / PDF.
- **Stack core:** PostgreSQL + TimescaleDB + FastAPI + React Native (Expo) + Next.js.
- **Intelligence:** Classical ML + rule engine + IPCC formulas. **No LLM in core path.** Optional small LLM only for voice input + WhatsApp Q&A in later phase.
- **Prototype cost:** $0–10/month (local + free tier). Production at 50 farms: ~$3K/year infra.
- **Phasing:** Local dev (0-2mo) → Free tier 1 pilot (2-4mo) → Hetzner $5 VPS 3 pilots (4-8mo) → Production (12mo+).

---

## 1. Source Material (xlsx files)

### File A: `DairyMind Parametre Katalogu.xlsx`
**Role:** Master data dictionary for digital twin. 7 layers, 117 parameters.

**Sheets:**
1. `Tüm Parametreler` — full catalog (Layer / Name / Unit / Frequency / Method / Priority / AI Use / Notes)
2. `Katman Özeti` — per-layer summary (count columns empty — COUNTIFS formulas missing, low priority fix)
3. `Toplama Takvimi` — parameter × collection-frequency matrix

**Layer distribution:**
| # | Layer | Params |
|---|-------|--------|
| 1 | 🐄 Individual Animal | 15 |
| 2 | 🥛 Production & Milk Quality | 16 |
| 3 | 🍼 Reproduction | 18 |
| 4 | 🌾 Nutrition & Feed | 16 |
| 5 | 🌡️ Barn & Environment | 19 |
| 6 | 🌍 Emissions & Sustainability | 13 |
| 7 | 💰 Financial | 20 |
| | **TOTAL** | **117** |

**Priority flags:** 🔴 Critical / 🟠 Important / 🟡 Useful.
**Reference values embedded:** IPCC Tier 2, Turkey grid EF 0.44, EU avg 1.0–1.4 kgCO2eq/kg milk, etc.

### File B: `DairyMind Cifftlik Anketi.xlsx` (typo: should be "Çiftlik")
**Role:** Onboarding survey, one-time farm intake. 14 sections, 261 questions, ~2-3h fill time.

**Sheets:** 1 intro + 14 sections + 1 completion summary.

**Section row schema (every section):** `# / Soru No / Soru / Yanıt Tipi / Seçenekler-Birim / CEVABINIZ / Önem / Modül`

| # | Section | Q | Importance |
|---|---------|---|------------|
| 1 | Business Identity & Legal | 18 | CRITICAL |
| 2 | Land & Infrastructure | 28 | CRITICAL |
| 3 | Herd Structure | 20 | CRITICAL |
| 4 | Health & Reproduction | 24 | HIGH |
| 5 | Milk Production & Quality | 18 | CRITICAL |
| 6 | Nutrition & Feed System | 28 | CRITICAL |
| 7 | Milking System | 15 | HIGH |
| 8 | Labor & Management | 15 | MEDIUM |
| 9 | Financial Structure | 25 | CRITICAL |
| 10 | Marketing & Sales | 16 | HIGH |
| 11 | Technology & Digitalization | 18 | MEDIUM |
| 12 | Environment & Sustainability | 14 | MEDIUM |
| 13 | Goals & Strategy | 12 | HIGH |
| 14 | Risk & Operational | 10 | MEDIUM |
| | **TOTAL** | **261** | |

**Issues found:**
- Filename typo `Cifftlik` → `Çiftlik`.
- Intro page says "~250 questions", actual 261.
- Completion summary sheet has no auto-fill % formula.
- "Katman Özeti" Critical/Important/Useful columns hardcoded 0 — need COUNTIFS.
- Dropdown options in "Seçenekler" column often empty (likely defined via data validation lists not visible in dump).

### Survey → Catalog mapping
| Survey section | Catalog layer |
|----------------|---------------|
| 3 Herd | K1 Individual Animal |
| 5 Milk Production | K2 Milk |
| 4 Health & Repro | K3 Reproduction |
| 6 Feed | K4 Nutrition |
| 2 Land + 7 Milking | K5 Barn & Environment |
| 12 Sustainability | K6 Emissions |
| 9 Finance + 10 Marketing | K7 Financial |

Survey = static one-time. Catalog = continuous sensor + manual flow.

---

## 2. Product Vision

### Target segments (3 tiers)
| Tier | Head | Params used | Sensors | Price/mo | Data entry |
|------|------|-------------|---------|----------|------------|
| BASIC | 10–50 | 25 (manual-heavy) | None (phone only) | ₺500 | Mobile, voice notes |
| PRO | 50–200 | 60 (semi-auto) | Milk meter + THI + pedometer | ₺3,000 | Hybrid |
| ENTERPRISE | 200+ | 117 (full catalog) | Bolus + inline milk + camera | ₺15,000+ | Full auto |

**Pilot starts with BASIC.** Sensor CAPEX kills small-farm adoption.

### Output types
- **Farmer (mobile-first):** Morning screen "3 cows in heat, 1 mastitis suspect, 2 to dry off." Voice summary. Weekly 1-page WhatsApp PDF.
- **Vet/consultant:** Herd score, anomaly heatmap, drug stock.
- **Bank/insurer (B2B revenue):** Farm credit score, TARSİM risk score.
- **Coop/dairy plant:** Anonymized regional dashboard.

---

## 3. Architecture

```
[FIELD LAYER]
  Pedometer/Bolus (LoRa/BLE) ──┐
  Milk meter (Modbus/RS485) ───┤
  Barn IoT (THI, gas, water) ──┼──► [EDGE GATEWAY] (Raspberry Pi)
  Manual: Mobile app (offline) ┘            │
                                            │ MQTT/HTTPS
                                            ▼
[CLOUD LAYER]
  Ingest:  MQTT (EMQX) → Kafka/Redpanda (later)
  Store:
    - TimescaleDB (sensor time-series)
    - PostgreSQL (animal/finance/farm)
    - MinIO/S3 / Cloudflare R2 (photo, video, lab results)
  Compute:
    - Feature store (derived: THI, FCR, EBM)
    - ML models (mastitis, heat, ketosis, yield forecast)
    - Economy engine (ration-milk-price scenarios)
  API: FastAPI
  Auth: Keycloak (multi-tenant) — postpone to phase 2; phase 1 use simple JWT

[USER LAYER]
  Web dashboard (Next.js + Tremor/Recharts)
  Mobile app (Expo React Native)
  WhatsApp Business API (alerts)
  PDF reports (WeasyPrint / Puppeteer)
```

### Prototype simplifications
- Skip EMQX/Kafka. Use HTTPS POST from mobile + cron jobs.
- Skip Keycloak. Use FastAPI-Users or simple JWT.
- Skip Kubernetes. Docker Compose on single VM.
- Skip MinIO. Use Cloudflare R2 free tier or local filesystem.

---

## 4. Tech Stack (locked-in choices)

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | Python 3.12 + FastAPI + Pydantic v2 | Fast dev, ML libs native |
| ORM | SQLAlchemy 2.0 + Alembic | Standard |
| DB | PostgreSQL 16 + TimescaleDB ext | Time-series + relational in one |
| Cache/queue | Redis | Celery broker, sessions |
| Worker | Celery + Beat | Cron jobs (daily summary, alert eval) |
| ML | scikit-learn, XGBoost, Prophet, PuLP | All CPU, no GPU |
| Voice (later) | Whisper (faster-whisper, local) | Turkish, free |
| LLM (optional later) | Anthropic Haiku OR local Llama 3.1 8B / Qwen 2.5 7B | Cheap, only for WhatsApp Q&A |
| Mobile | React Native + Expo (SDK 51+) | One codebase iOS/Android, OTA updates |
| Mobile offline | WatermelonDB or SQLite + sync layer | Field connectivity poor |
| Web | Next.js 14 (App Router) + Tailwind + Tremor | Dashboard fast |
| Messaging | WhatsApp Business API (Meta direct or Twilio) | Farmer already uses WhatsApp |
| Infra (prototype) | Docker Compose on Hetzner CX22 | $4/mo |
| Infra (scale) | k3s on 2-3 nodes | Later |
| Hosting region | Turkey (Türk Telekom Cloud) or EU (Hetzner FSN) | KVKK |
| CI | GitHub Actions | Free tier |
| Monitoring | Uptime Kuma + Loki (self-host) | Free |
| Error tracking | Sentry free tier | Free |

---

## 5. Data Model (MVP, 12 tables)

```sql
-- Tenancy
farm(id, name, gps_lat, gps_lon, tier, owner_user_id, created_at, kvkk_consent_at)
user(id, farm_id, role, phone_e164, email, password_hash, lang, created_at)

-- Herd
animal(id, farm_id, ear_tag, breed, dob, sex, dam_id, sire_id, status, entry_date, exit_date, exit_reason)
lactation(id, animal_id, lact_no, calving_date, dry_off_date, days_in_milk_at_close)

-- Events
milking(id, animal_id, ts, kg, fat_pct, protein_pct, scc, conductivity, milking_no_of_day)
health_event(id, animal_id, ts, type, severity, vet_id, cost_try, drug_code, withdrawal_until, notes)
reproduction_event(id, animal_id, ts, type, outcome, bull_code, dim_at_event, notes)
  -- type: heat | ai | preg_check | calving | abortion | dry_off

-- Feed & finance
feed_ration(id, farm_id, date, group_name, dm_kg, cp_pct, ndf_pct, nel_mcal, cost_try, head_count)
finance_tx(id, farm_id, ts, category, amount_try, source, ref_no)
  -- category: milk_sale | feed | vet | labor | energy | subsidy | other

-- Sensor (TimescaleDB hypertable)
sensor_reading(ts, sensor_id, farm_id, metric, value)
  -- hypertable on ts, partition by farm_id

-- Sustainability
emission_calc(id, farm_id, period_start, period_end, ch4_kg, n2o_kg_co2eq, co2_energy_kg, co2_per_kg_milk)

-- Alerts
alert(id, farm_id, animal_id NULL, ts, type, severity, payload_json, ack_at, ack_by)
  -- type: mastitis_suspect | heat_detected | dry_off_due | cull_recommended | thi_high | feed_price_alert | preg_check_due
```

**Indexes:**
- `animal(farm_id, status)`, `animal(ear_tag)`
- `milking(animal_id, ts DESC)`
- `health_event(animal_id, ts DESC)`
- `sensor_reading` hypertable auto chunking by week
- `alert(farm_id, ack_at NULL, ts DESC)` for unack alerts

---

## 6. ML / Rule Catalog (LLM-free core)

| Task | Method | Inputs | Output | Threshold/Target |
|------|--------|--------|--------|------------------|
| Mastitis early warning | XGBoost classifier | SCC, conductivity, milk_kg trend (7d delta), DIM | prob 0-1 | alert if p > 0.7 |
| Heat detection | Rule + delta | pedometer steps/day, baseline | binary | steps > 2× baseline 8h window |
| Ketosis risk | Logistic regression | BHB, BCS, DIM, parity | prob | p > 0.5 → vet check |
| Lactation curve fit | Wood model (parametric) | daily milk per cow | a, b, c params | per animal |
| Yield forecast (herd) | Prophet | daily total milk, weather, DIM mix | 30d forecast | MAPE < 8% |
| Ration optimization | Linear programming (PuLP) | NRC requirements, feed prices, available feeds | kg per feed | min cost s.t. NEL, CP, NDF |
| THI | Formula | T, RH | scalar | >72 heat stress |
| FCR | Formula | feed_dm_kg, milk_kg | ratio | <1.5 good |
| GHG | IPCC Tier 2 | herd, ration, manure mgmt | kgCO2eq | report |
| Anomaly (water, THI) | Isolation Forest | daily aggregates | score | top 1% flagged |
| Cull recommendation | Rule + econ model | SCC trend, lact_no, recent yield, mastitis count, age | tut/sat + ₺ impact | composite score |
| Dry-off due | Rule | DIM, current yield, last preg_check | binary | DIM > 305 or yield < 12kg |
| Pregnancy check due | Rule | last AI date | binary | 28d post-AI |
| Subsidy match | Rule engine | farm profile vs gov programs | list of eligible | rule table |

**Implementation order (priority):**
1. Wood curve + yield forecast (cheap, high value)
2. Mastitis XGBoost (huge ROI claim)
3. Cull/dry-off/preg-check rules (immediate UX win)
4. Heat detection (needs pedometer — phase 2)
5. Ration LP (needs feed price feed)
6. GHG / emissions (compliance, phase 3)

---

## 7. Roadmap (12 months)

### Phase 0 — Prep (week 0-4)
- Select 3 pilot farms (Konya / Trakya / İzmir mix)
- Port survey to Typeform/Tally (mobile-friendly)
- Vet + agronomist advisory board
- Repo + monorepo structure
- Convert catalog xlsx → `params.json` (machine-readable master)

### Phase 1 — MVP / BASIC tier (month 1-4)
- Backend: Postgres + Timescale + FastAPI + Alembic + JWT
- Core tables (12 above)
- Mobile app screens:
  - Login / farm picker
  - Animal list + detail
  - Milking entry (per cow, per session)
  - Health event entry
  - Daily dashboard
- Web dashboard: herd overview, milk graph, P&L
- Daily PDF report cron (WeasyPrint)
- WhatsApp alerts: dry-off, preg-check, vaccination reminders
- 3 pilots live

### Phase 2 — PRO tier + IoT (month 4-8)
- Milk meter integration (DeLaval/GEA/Boumatic Modbus reader on Pi)
- LoRaWAN gateway: THI + ammonia + water meter
- Pedometer ingestion (Cowmanager/Nedap-clone via BLE bridge)
- Mastitis ML v1 (XGBoost on collected pilot data)
- Ration optimizer (NRC standard + PuLP)
- 10-15 pilots

### Phase 3 — Digital twin + ML (month 8-12)
- Wood curve per cow
- Scenario engine: "feed +20%?", "milk price -₺3?"
- Carbon report (IPCC Tier 2 + CBAM prep)
- Subsidy matcher rule engine (TKDK/IPARD/TARSİM)
- Bull selection genetic advisor

### Phase 4 — Scale (12+ month)
- 100+ farms
- B2B: dairy plant integration (collection planning)
- Marketplace: feed supplier, vet booking
- Bank credit score API

---

## 8. Cost Reality (prototype)

| Phase | Duration | $/mo | Cumulative |
|-------|----------|------|------------|
| Local dev | mo 0-2 | 0 | 0 |
| Free tier (Supabase + Vercel + Expo + 1 pilot) | mo 2-4 | 0-5 | 0-20 |
| Hetzner CX22 + domain (3 pilots) | mo 4-8 | 8-15 | 50-100 |
| Hetzner CX32 + R2 + monitor (10 farms) | mo 8-12 | 15-25 | 200-300 |
| Production 50 farms | mo 12+ | 200-300 | — |

**Prototype yearly TOTAL: $100-200 (~₺3,500-7,000).** Sensors separate; not needed for BASIC pilot.

### Free tier loadout
- Backend: Fly.io free 3 VMs / Railway $5 credit / Render free
- DB: Supabase free 500MB / Neon free 3GB
- Frontend: Vercel free / Netlify free
- Mobile: Expo Go dev build
- Storage: Cloudflare R2 free 10GB
- Email: Resend free 3K/mo
- Monitoring: Uptime Kuma self-host
- LLM (if used): Anthropic Haiku $0.25/1M tokens

---

## 9. Project Structure (recommended monorepo)

```
dairymind/
├── README.md
├── PROJECT_BRIEF.md            # this file
├── docker-compose.yml          # postgres + timescale + redis + api + web
├── .env.example
├── params/
│   ├── catalog.json            # 117 params from xlsx, machine-readable
│   └── survey.json             # 261 questions
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── api.md
│   └── ml-models.md
├── apps/
│   ├── api/                    # FastAPI
│   │   ├── pyproject.toml
│   │   ├── alembic/
│   │   └── src/
│   │       ├── main.py
│   │       ├── models/
│   │       ├── routers/
│   │       ├── services/
│   │       ├── ml/
│   │       └── jobs/           # celery tasks
│   ├── web/                    # Next.js dashboard
│   │   ├── package.json
│   │   └── app/
│   └── mobile/                 # Expo React Native
│       ├── package.json
│       └── app/
├── packages/
│   ├── shared-types/           # zod/pydantic schemas exported as TS types
│   └── ui/                     # shared component lib (later)
└── infra/
    ├── hetzner/                # terraform or simple bash
    └── github-actions/
```

---

## 10. Immediate Next Steps (when resuming on new machine)

1. **Receive files:** `PROJECT_BRIEF.md` + 2 xlsx files.
2. **Read xlsx if not already done** — give Claude both xlsx paths; ask for re-analysis if context lost.
3. **Bootstrap repo:**
   ```bash
   mkdir dairymind && cd dairymind
   git init
   # copy PROJECT_BRIEF.md + xlsx files in
   ```
4. **First code task (suggested):** Convert catalog xlsx → `params/catalog.json`. Schema:
   ```json
   {
     "layers": [
       {"id": 1, "name_tr": "Bireysel Hayvan", "name_en": "Individual Animal", "icon": "🐄"}
     ],
     "parameters": [
       {
         "id": "ear_tag",
         "layer_id": 1,
         "name_tr": "Küpe / Kulak Numarası",
         "unit": null,
         "frequency": "once",
         "method": "manual",
         "priority": "critical",
         "analysis": "rule",
         "notes": "TR official standard"
       }
     ]
   }
   ```
5. **Second code task:** Convert survey xlsx → `params/survey.json` (sectioned question list with type/options/importance/module).
6. **Third code task:** Bootstrap FastAPI + Postgres + first migration with 12 core tables.
7. **Fourth code task:** Expo mobile shell — login + animal list screen + milking entry form.

---

## 11. Open Decisions (need answer before scale)

- **Hosting region:** Turkey (TT Cloud, slower CI tooling) vs EU (Hetzner FSN, KVKK gray area). Prototype use EU. Production decide with legal review.
- **WhatsApp provider:** Meta direct (cheaper, harder onboarding) vs Twilio (easier, more expensive). Prototype use Meta sandbox.
- **Pricing model:** Flat tier vs per-head vs % of milk revenue. Test in pilot conversations.
- **Sensor strategy:** Own hardware brand vs reseller (DeLaval/Lely partnership). Phase 2 decision.
- **Local LLM vs API:** Llama 3.1 8B self-host on $20/mo GPU VM vs Anthropic Haiku pay-per-call. Likely Haiku until volume justifies GPU.

---

## 12. Risks Register

| Risk | Mitigation |
|------|------------|
| Farmer won't enter data | Voice input (Whisper TR). Auto from sensors. WhatsApp prompts. |
| No internet at farm | Edge gateway 7-day buffer. Mobile offline-first sync. |
| Sensor cost blocks adoption | BASIC tier sensor-free. PRO leasing model. |
| Data quality poor | Validation at survey time. "≈" approximate flag built into catalog. |
| KVKK/EU data residency | Host in Turkey region. Document consent flow. |
| Competition (DeLaval/Lely) | Turkish UX + small farm + tier pricing differentiator. |
| Vet liability (wrong diagnosis) | Recommendations only, not prescriptions. Disclaimer + vet-in-loop. |
| Government regulation shift | Modular subsidy rule engine, swap rules without code change. |

---

## 13. Glossary (TR ↔ EN, dairy-specific)

| TR | EN | Note |
|----|----|------|
| Küpe / Kulak No | Ear tag | TR + 13 digit |
| Laktasyon | Lactation | Milking period |
| DIM (Laktasyondaki Gün) | Days In Milk | Days since calving |
| Kuru dönem | Dry period | 45-60d before next calving |
| Buzağılama aralığı | Calving interval | Target <400d |
| SHS (Somatik Hücre) | SCC (Somatic Cell Count) | Mastitis indicator |
| BCS | Body Condition Score | 1-5 scale |
| THI | Temperature-Humidity Index | Heat stress |
| FCR | Feed Conversion Ratio | kg feed / kg milk |
| TMR | Total Mixed Ration | |
| NEL | Net Energy Lactation | Mcal/kg |
| NDF | Neutral Detergent Fiber | % |
| MUN | Milk Urea Nitrogen | mg/dL |
| BHB | Beta-Hydroxybutyrate | Ketosis marker |
| Iskarta | Cull | Sell for meat |
| Düve | Heifer | Young female, not yet calved |
| Tohumlama | Insemination | AI |
| Kızgınlık | Estrus / Heat | Reproductive window |
| Ahır | Barn | |
| Sağım | Milking | |

---

## 14. Pointer: Where to Find Things

- **Survey questions:** `DairyMind Cifftlik Anketi.xlsx` → sheets 1–14
- **Parameter dictionary:** `DairyMind Parametre Katalogu.xlsx` → "Tüm Parametreler"
- **Collection frequency matrix:** same file → "Toplama Takvimi"
- **This brief:** `PROJECT_BRIEF.md`

---

## 15. Prompt to Use on New Machine

Paste this to Claude when resuming:

> I'm continuing the DairyMind project. Read `PROJECT_BRIEF.md` in current directory for full context. Two xlsx files are also present (catalog + survey). Confirm you understand the project, then we'll continue from section 10 step N.

---

*End of brief. Last updated: 2026-05-25.*
