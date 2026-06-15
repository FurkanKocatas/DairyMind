# DairyMind

Türkiye süt çiftlikleri için dijital ikiz platformu. 261 soruluk "Çiftlik Anketi" + çiftçi cevapladıkça canlı inşa olan animasyonlu çiftlik görseli.

## Yapı

- **`anket-app/`** — ana uygulama (Node.js + Express + SQLite, Alpine.js + Tailwind, Vue 3 farm-engine web component). Kurulum ve deploy için bkz. [`anket-app/README.md`](anket-app/README.md) ve [`anket-app/DEPLOY.md`](anket-app/DEPLOY.md).
- **`*.xlsx`** — anket + parametre kaynak dosyaları (`anket-app/scripts/extract.py` bunlardan `data/questions.json` üretir).
- **[`STATUS.md`](STATUS.md)** — güncel durum: mimari, onboarding modeli, güvenlik, ne yapıldı / ne kaldı. **Önce burayı oku.**
- **`PROJECT_BRIEF.md`** — ilk proje kapsamı/notları (tarihsel).

## Hızlı başlangıç (yerel)

```bash
cd anket-app
npm install
# Windows PowerShell:
$env:ADMIN_TOKEN="guclu-bir-token"; node server.js
# → http://localhost:3000   admin: http://localhost:3000/admin
```

Üretimde `ADMIN_TOKEN` env zorunludur (yoksa server başlamaz). Çiftçiler yalnızca admin panelinden üretilen davet linkiyle girer.

> **Not:** `db/` (çiftçi verisi), `node_modules/`, `*.zip` ve `start-test.cmd` repoya dahil değildir (`.gitignore`).
