# DairyMind — Proje Durumu (STATUS)

> Güncel çalışma durumu. Tarihsel kapsam için [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md).
> **Son güncelleme:** 2026-06-16

## Ne / kim için

Türkiye küçük–orta süt çiftlikleri için dijital ikiz platformu. 261 soruluk "Çiftlik Anketi" + çiftçi cevapladıkça canlı inşa olan animasyonlu çiftlik görseli. Yakın hedef: ~5–10 çiftliğe demo, Hostinger'da host.

## Mimari / stack

- **Backend:** Node 22+ · Express · `node:sqlite` (`DatabaseSync`) · nanoid · crypto. Tek dosya: [`anket-app/server.js`](anket-app/server.js).
- **Frontend:** vanilla HTML + Alpine.js + Tailwind (self-hosted: `anket-app/public/vendor/`).
- **Çiftlik görseli:** Vue 3 + Vite web component `<dm-farm-scene>` → derlenmiş `anket-app/public/farm-engine/`; kaynak `anket-app/farm-engine/`.
- **DB:** SQLite (WAL) → `anket-app/db/anket.db` (server otomatik oluşturur; **repoda yok** — kişisel veri).
- **Sorular:** `*.xlsx` → `scripts/extract.py` + `data/overrides.json` → `data/questions.json`.

## Onboarding modeli — DAVET ONLY (karar: 2026-06-14)

1. Admin panel → **"Yeni Çiftçi Ekle"** → `POST /api/admin/invite` → `consent_at=NULL` satır + sihirli link `/anket/{id}?t={access_token}`.
2. WhatsApp ile çiftçiye gönder.
3. Çiftçi linki açar → URL token'ı localStorage'a yazılır + adres çubuğundan temizlenir → **KVKK rıza kapısı** → anket.
4. Devam = aynı linki tekrar aç (telefon/OTP/SMS yok).

- **Public self-signup KİLİTLİ:** `POST /api/submissions` admin yetkisi ister; landing (`/`) "davet ile giriş" notu gösterir, kayıt formu gizli.
- OTP/SMS yok — SMS gateway bağlı değil; 10 çiftlik için gereksiz.

## Güvenlik (yapıldı + smoke-test edildi)

- Per-submission `access_token` (IDOR fix), timing-safe karşılaştırma.
- `ADMIN_TOKEN` prod'da **zorunlu** (yoksa server başlamaz); repoda token yok.
- **KVKK:** rıza kaydı (`consent_at` + `consent_version`), rıza öncesi cevap yazımı `409` ile bloklu, silme endpoint (erasure).
- **Rate limiting** (in-memory): create 5/dk · write 120/dk · invite/admin 30/dk.
- CSV formül-injection nötrleme; CSP / HSTS / nosniff / X-Frame-Options; `x-powered-by` gizli.
- JSON export'tan `access_token` temizlendi (dosya paylaşılabilir).
- Merkezi hata middleware (prod'da iç mesaj gizli); graceful shutdown + WAL checkpoint.

## Veri akışı (demo'nun "asıl tarafı")

- Cevaplar SQLite'a yazılır; **tipler korunur** (sayı/ondalık/dizi), Türkçe UTF-8 bozulmaz.
- Admin panel → **JSON Export** (`data[].answers[]` yapısı, dijital-ikiz ürünü bunu tüketir) veya **CSV Export** (Excel).
- Doğrulama: 22 kontrol geçti — round-trip birebir, diske yazım bağımsız bağlantıyla kanıtlı.

## Frontend durumu

| Sayfa | Durum |
|---|---|
| `index.html` | Davet-only landing (kayıt formu + OTP sekmesi gizli) |
| `anket.html` | 261 soru SPA; offline cache + "kaydedilemedi" banner; accessDenied overlay; KVKK kapısı; KRİTİK zorunlu; jargon help text; hataya jumpTo |
| `cifligim.html` | Dijital ikiz görünüm + hızlı düzenle (token auth) |
| `admin.html` | Davet + link/WhatsApp + JSON/CSV export + yerleşim editörü |
| `tamamlandi.html`, `yerlesim.html` | Tamamlandı sayfası / layout editör |

## Yapılacaklar (cilalar)

- [ ] Gerçek SMS gateway (yalnız self-signup/OTP geri istenirse — şu an gereksiz)
- [ ] Mobil tap-target iyileştirme
- [ ] Anket sırasında dijital-ikiz teaser
- [ ] Tamamlandı → `/cifligim` linki
- [ ] Sesli giriş (voice input)
- [ ] Köy alanı
- [ ] Otomatik DB yedeği

## Çalıştırma

```bash
# Yerel
cd anket-app && npm install
# PowerShell:
$env:ADMIN_TOKEN="guclu-bir-token"; node server.js   # → http://localhost:3000
```

Deploy: [`anket-app/DEPLOY.md`](anket-app/DEPLOY.md) (Hostinger). `ADMIN_TOKEN` env zorunlu; redeploy'da `db/` üzerine yazma.

## Gotchas

- **bash curl Türkçe UTF-8 bozar** → API testini `node fetch` veya tarayıcı ile yap.
- `overrides.json` değişince → `python scripts/extract.py` (questions.json yeniden üret) + tailwind rebuild (`build-css/`) + view'larda `?v=` bump.
- `db/` kişisel veri içerir → **asla git'e koyma** (`.gitignore`'da).
