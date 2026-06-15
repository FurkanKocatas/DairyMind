"""Enrich overrides.json: add integer/step/allow_negative + convert top-3 → ranked_text + percentage caps."""
import json
from pathlib import Path

P = Path(__file__).resolve().parents[1] / "data" / "overrides.json"
data = json.loads(P.read_text(encoding="utf-8"))

# Helpers
def set_int(qid, **extra):
    if qid in data:
        data[qid].setdefault("type", "number")
        data[qid]["integer"] = True
        data[qid]["step"] = 1
        for k, v in extra.items():
            data[qid][k] = v

def set_decimal(qid, step, **extra):
    if qid in data:
        data[qid].setdefault("type", "number")
        data[qid]["step"] = step
        for k, v in extra.items():
            data[qid][k] = v

def allow_neg(qid):
    if qid in data:
        data[qid]["allow_negative"] = True

def force_pct(qid):
    if qid in data:
        data[qid].setdefault("type", "number")
        data[qid]["min"] = 0
        data[qid]["max"] = 100
        data[qid]["step"] = 0.1
        data[qid]["unit"] = "%"

def to_year(qid, mn=1900, mx=2030):
    if qid in data:
        data[qid]["type"] = "year"
        data[qid]["integer"] = True
        data[qid]["step"] = 1
        data[qid]["min"] = mn
        data[qid]["max"] = mx
        data[qid]["validation"] = {"min": mn, "max": mx}

def ranked3(qid, labels, placeholder=""):
    if qid in data:
        data[qid] = {
            "type": "ranked_text",
            "count": 3,
            "labels": labels,
            "placeholder": placeholder,
            "help": data[qid].get("help", "")
        }

# ---------- Integer fields (counts, bash, kişi, vaka, müşteri, gün, etc.) ----------
INTEGERS = [
    "q_1_1_13",
    "q_2_2_8","q_2_2_9","q_2_2_18","q_2_2_19","q_2_2_22","q_2_2_24","q_2_2_26",
    "q_3_3_1","q_3_3_2","q_3_3_3","q_3_3_4","q_3_3_5","q_3_3_6","q_3_3_12","q_3_3_13","q_3_3_19",
    "q_4_4_4","q_4_4_11","q_4_4_12","q_4_4_24",
    "q_5_5_1","q_5_5_3","q_5_5_4","q_5_5_5","q_5_5_9","q_5_5_10",
    "q_6_6_4","q_6_6_5","q_6_6_6","q_6_6_7","q_6_6_10","q_6_6_19","q_6_6_22","q_6_6_24",
    "q_7_7_6",
    "q_8_8_1","q_8_8_2","q_8_8_3","q_8_8_4","q_8_8_5","q_8_8_6",
    "q_10_10_6","q_10_10_7","q_10_10_8","q_10_10_9","q_10_10_12","q_10_10_14","q_10_10_15",
    "q_12_12_3","q_12_12_5","q_12_12_10",
    "q_13_13_2","q_13_13_3","q_13_13_5",
]
for q in INTEGERS:
    set_int(q)

# ---------- Currency fields (₺) — integer step 1, large numbers ----------
MONEY = [
    "q_2_2_3","q_4_4_15","q_6_6_13","q_6_6_24",
    "q_8_8_11","q_8_8_12",
    "q_9_9_1","q_9_9_4","q_9_9_5","q_9_9_7","q_9_9_10","q_9_9_14","q_9_9_19","q_9_9_22","q_9_9_23",
    "q_10_10_12","q_10_10_14",
    "q_13_13_5",
]
for q in MONEY:
    set_int(q)

# Allow negative for net profit / EBITDA / growth
allow_neg("q_9_9_2")
allow_neg("q_9_9_3")
data.setdefault("q_9_9_2", {})["type"] = "number"
data["q_9_9_2"]["integer"] = True
data["q_9_9_2"]["step"] = 1
data.setdefault("q_9_9_3", {})["type"] = "number"
data["q_9_9_3"]["integer"] = True
data["q_9_9_3"]["step"] = 1

# 5 yıl önce ciro can be 0+ (integer)
set_int("q_9_9_19")

# 5y büyüme oranı: negative allowed (-100..1000 already), decimal
data["q_9_9_20"]["step"] = 0.1
allow_neg("q_9_9_20")

# ---------- Percentages (0-100, step 0.1) ----------
PERCENTAGES = [
    "q_3_3_11",  # yenileme oranı
    "q_4_4_5","q_4_4_8","q_4_4_9","q_4_4_13",  # mastitis %, ölüm %, etc.
    "q_6_6_14",  # yem/süt geliri %
    "q_8_8_15",  # devir hızı %
    "q_9_9_6","q_9_9_9","q_9_9_17",  # finansal %
    "q_12_12_7",  # yenilenebilir %
]
for q in PERCENTAGES:
    force_pct(q)

# ---------- Decimal fields (step explicit) ----------
# BCS scale 1-5, step 0.25
set_decimal("q_1_1_9", 1)  # year not decimal — actually it's year
set_decimal("q_3_3_9", 0.1, min=1, max=10)  # ortalama laktasyon no
set_decimal("q_3_3_10", 0.1, min=1, max=15)  # ortalama yaş
set_decimal("q_4_4_6", 0.1, min=1, max=5)  # topallık skoru ortalama
set_decimal("q_5_5_2", 0.1, min=0, max=80)  # kg/gün
set_decimal("q_5_5_6", 0.01, min=0, max=10)  # yağ %
set_decimal("q_5_5_7", 0.01, min=0, max=10)  # protein %
set_decimal("q_5_5_8", 0.01, min=0, max=10)  # laktoz %
set_decimal("q_5_5_15", 0.01, min=0)  # ₺/kg
set_decimal("q_6_6_2", 0.1, min=0, max=100)  # TMR kg/inek
set_decimal("q_6_6_8", 0.1, min=0)  # kg KM
set_decimal("q_6_6_9", 0.1, min=0)  # kg/gün konsantre
set_decimal("q_6_6_18", 1, min=0, max=300)  # L/gün (integer ok)
set_decimal("q_7_7_2", 0.1, min=0, max=10)  # saat/sağım
set_decimal("q_7_7_3", 0.1, min=0, max=10)  # kg/dk
set_decimal("q_7_7_4", 0.5, min=30, max=60)  # kPa
set_decimal("q_12_12_6", 0.1, min=0)  # kWp
set_decimal("q_14_14_7", 0.1, min=0)  # km

# Years (4 digit strict)
to_year("q_1_1_8")
to_year("q_1_1_9")
to_year("q_2_2_10", 1950, 2030)

# ---------- Top-N text fields → ranked_text ----------
ranked3("q_3_3_8", labels=["Irk 1", "Irk 2", "Irk 3"], placeholder="Örn: %85 Holstein")
# Actually 3.8 is single text describing distribution — keep as text, but enrich placeholder
data["q_3_3_8"] = {
    "type": "text",
    "placeholder": "Örn: %85 Holstein, %15 Simental",
    "help": "Tüm ırklar ve yüzdelerini virgülle yazın"
}

ranked3("q_4_4_16",
    labels=["1. En sık sorun", "2. En sık sorun", "3. En sık sorun"],
    placeholder="Örn: Mastitis")

ranked3("q_9_9_21",
    labels=["1. Gider kalemi", "2. Gider kalemi", "3. Gider kalemi"],
    placeholder="Örn: Yem")

ranked3("q_13_13_7",
    labels=["1. Endişe / sorun", "2. Endişe / sorun", "3. Endişe / sorun"],
    placeholder="Örn: İşçi bulamamak")

ranked3("q_14_14_1",
    labels=["1. Yaşanan büyük olay", "2. Yaşanan büyük olay", "3. Yaşanan büyük olay"],
    placeholder="Örn: Şap salgını 2023")

# Free-text but with hint they can pick "Yok"
data["q_13_13_12"] = {
    "type": "textarea",
    "placeholder": "Örn: 200 baş sürü, 10.000 kg/inek/laktasyon, %30 brüt marj",
    "help": "Açık ve sayısal hedef yazın"
}

data["q_14_14_10"] = {
    "type": "textarea",
    "placeholder": "Operasyonel zorluğunuzu açıkça yazın",
    "help": ""
}

# Special: 2.11 (ahır son yenileme) — "YYYY veya Yok"
data["q_2_2_11"] = {
    "type": "year_or_none",
    "min": 1950,
    "max": 2030,
    "placeholder": "YYYY veya 'Yok'",
    "help": "Yıl girin veya 'Yok' yazın"
}

# Special: 10.5 (sözleşme yenileme) — Month/Year picker
data["q_10_10_5"] = {
    "type": "month_year",
    "placeholder": "AA/YYYY",
    "help": "Ay ve yıl seçin"
}

P.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Enriched overrides: {len(data)} entries")
