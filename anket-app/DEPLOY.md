# Hostinger Deploy Rehberi

Node.js + SQLite app. Build step yok. Sadece upload + npm install + start.

## Ön Koşullar

- Hostinger plan: **Premium / Business / Cloud** (Node.js destekleyen plan)
- Domain hPanel'e bağlı
- Node.js ≥ 22 (built-in `node:sqlite` modülü için zorunlu)

## Adım 1 — Repo Hazırlığı (Yerel)

`db/`, `node_modules/`, `.env` dosyaları yüklenmez. `.gitignore` zaten kapsıyor.

Sıkıştır:
```bash
cd C:\Users\furkan\Documents\dev\dairymind\anket-app
# Windows PowerShell:
Compress-Archive -Path package.json,server.js,scripts,data,public,views,README.md,DEPLOY.md,.gitignore,.env.example -DestinationPath dairymind-anket.zip -Force
```

Veya Git üzerinden:
```bash
git init
git add .
git commit -m "init dairymind anket"
git remote add origin <hostinger-git-url>
git push -u origin main
```

## Adım 2 — Hostinger hPanel

1. **hPanel → Websites → [domainin] → Advanced → Node.js**
2. **Create Application**:
   - Node version: **22.x** (LTS) — eksikse 20.x denenebilir ama 22 önerilir
   - Application mode: **Production**
   - Application root: `public_html/anket` (kendi seçimin)
   - Application URL: `anket.yourdomain.com` veya `yourdomain.com/anket`
   - Application startup file: `server.js`
3. **Create** → app slot oluşturulur

## Adım 3 — Dosya Upload

İki yol:

**A) File Manager / FTP:**
- hPanel → File Manager → `public_html/anket/` aç
- Zip yükle → sağ tık → Extract

**B) Git (önerilir):**
- Hostinger Git deploy varsa kullan
- Yoksa SSH:
  ```bash
  ssh u123456@yourdomain.com
  cd domains/yourdomain.com/public_html/anket
  git clone <repo-url> .
  ```

## Adım 4 — Bağımlılık Kurulumu

hPanel Node.js sayfasında **NPM Install** butonu var. Bas, bekle.

Veya SSH:
```bash
cd ~/domains/yourdomain.com/public_html/anket
npm install --omit=dev
```

`node:sqlite` built-in olduğundan native compile derdi yok. Sadece `express` ve `nanoid` indirilir (~50 paket).

### farm-engine (Vue 3 dijital ikiz)

Bu klasör **opsiyonel kaynak kodu**. Hostinger'da `npm install` etmen GEREKMEZ — built artifact'lar zaten dahil:
- `public/farm-engine/farm-scene.js` (Web Component — anket + cifligim sayfalar kullanır)
- `public/farm-engine/farm-engine.css`
- `farm-engine/dist/` (SPA preview — /preview/ route)

Yeniden build etmek istersen (kaynak değişti):
```bash
cd farm-engine
npm install
npm run build           # SPA → dist/
npm run build:element   # Web Component → ../public/farm-engine/
```

Tasarımcı/dev iterasyonu için: `npm run dev` → localhost:5173 HMR.

## Adım 5 — Environment Variables

hPanel → Node.js app → **Environment Variables** bölümü:

```
NODE_ENV=production
ADMIN_TOKEN=<kendi-güçlü-token'ın>
PORT=<hostinger-otomatik-verir-bos-birak>
```

**ADMIN_TOKEN zorunludur.** `NODE_ENV=production` iken token yoksa sunucu başlamayı reddeder (güvenlik). Kendi güçlü token'ını üret ve buraya koy — repoda token tutma.

Token üretmek için (16 byte random, URL-safe):
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64url'))"
```
Çıktıyı `ADMIN_TOKEN` değeri yap. Kimseyle paylaşma, repoya commit'leme.

> **OTP/SMS notu:** Şu an `/api/resume/request` doğrulama kodunu sadece sunucu log'una yazıyor (SMS gateway henüz bağlı değil). Üretimde gerçek SMS için bir gateway (ör. Netgsm, İletimerkezi, Twilio) entegre edilmeli — kod `server.js` içinde `// TODO SMS` ile işaretli.

## Adım 6 — Klasör İzinleri

Server `db/` klasörü açıyor + SQLite dosyası yazıyor. Hostinger'da kullanıcı dizini zaten yazılabilir, sorun çıkmaz. SSH'tan kontrol:
```bash
ls -la ~/domains/yourdomain.com/public_html/anket/db/
# yoksa:
mkdir -p ~/domains/yourdomain.com/public_html/anket/db
chmod 755 ~/domains/yourdomain.com/public_html/anket/db
```

## Adım 7 — Restart

hPanel Node.js sayfası → **Restart** → app ayağa kalkar.

Log:
```
🐄 DairyMind Anket running on port <X>
   Mode: production
   Admin token: (custom set via env)
```

## Adım 8 — Test

| URL | Beklenen |
|-----|----------|
| `https://yourdomain.com/healthz` | `{"ok":true,"time":"..."}` |
| `https://yourdomain.com/` | Landing page (Yeni Başla / Devam Et) |
| `https://yourdomain.com/admin` | Şifre kutusu |
| `https://yourdomain.com/api/provinces` | 81 il JSON |

Admin şifresi gir → liste açılır → **+ Yeni Çiftçi Ekle** çalışmalı.

## Backup

DB tek dosya: `db/anket.db`. Düzenli yedek:

```bash
# Cron örnek (Hostinger Cron Jobs sekmesi):
0 3 * * * cp ~/domains/yourdomain.com/public_html/anket/db/anket.db ~/backups/anket-$(date +\%Y\%m\%d).db
```

Veya elle: hPanel File Manager → `db/anket.db` indir.

## Update / Yeni Versiyon

```bash
ssh u123456@yourdomain.com
cd ~/domains/yourdomain.com/public_html/anket
git pull            # veya zip extract
npm install --omit=dev
```
hPanel → Restart.

`db/` klasörüne dokunma, anket cevapları orada.

## Sık Sorunlar

| Hata | Çözüm |
|------|-------|
| `node:sqlite cannot find module` | Node sürümü <22. hPanel'den 22+ seç. |
| `EACCES db/anket.db` | `chmod 755 db/` veya app root altında oluştur |
| 502 Bad Gateway | App crash. hPanel log'a bak. Genelde env var eksik. |
| Provinces JSON 404 | `data/turkey-provinces.json` upload edilmedi |
| Static `validators.js` 404 | `public/` upload edilmedi |
| WhatsApp linki açılmıyor | Telefon `9XXX...` ile başlamıyor. server.js normalize OK, frontend OK — tarayıcı WhatsApp Web yüklü mü? |

## Güvenlik Checklist

- [x] `ADMIN_TOKEN` env'den zorunlu (prod'da yoksa başlamaz), timing-safe karşılaştırma
- [x] HTTPS kullan (Hostinger Let's Encrypt otomatik)
- [x] `x-powered-by` header gizli
- [x] Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [x] Static cache 7 gün
- [x] SQL injection güvenli (prepared statements)
- [x] Server-side input validation (telefon, isim, il) + soru ID allowlist
- [x] **IDOR korumalı** — her gönderim kendi `access_token`'ı ile okunur/yazılır (başka çiftçinin verisi okunamaz)
- [x] **OTP resume** — telefon + 6 haneli kod (10 dk geçerli, 5 deneme), enumeration yok
- [x] **Rate limiting** — in-memory (oluşturma 5/dk, yazma 120/dk, OTP iste 4/dk, doğrula 10/dk, admin 30/dk)
- [x] **CSV injection** — export'ta formül karakterleri (`=+-@`) nötrleştirilir
- [x] **KVKK rıza kaydı** — onay + versiyon + zaman damgası, silme endpoint'i (erasure)
- [x] Merkezi hata middleware (prod'da iç mesaj gizli) + graceful shutdown
- [ ] CSRF (form'lar same-origin + token bearer header, low risk; istenirse `csurf` eklenebilir)

## Performance Notu

10-50 çiftçi için SQLite + Express tek node yeterli. Yüksek trafik (1000+ eş zamanlı) gelirse:
- TimescaleDB/Postgres'e geç
- PM2 cluster mode
- Redis cache

Şu an için bu yapı 100K request/gün hatta üstünü rahat kaldırır.
