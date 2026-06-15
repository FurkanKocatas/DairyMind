/* DairyMind validators — TR-specific algorithms */
(function(global){
  // TC Kimlik No (11 digit + Mernis algorithm)
  function isValidTC(s) {
    if (typeof s !== 'string') s = String(s ?? '');
    s = s.trim();
    if (!/^[1-9]\d{10}$/.test(s)) return false;
    const d = s.split('').map(Number);
    const odd = d[0]+d[2]+d[4]+d[6]+d[8];
    const even = d[1]+d[3]+d[5]+d[7];
    const c10 = (odd*7 - even) % 10;
    if (((c10 % 10)+10)%10 !== d[9]) return false;
    const c11 = (d.slice(0,10).reduce((a,b)=>a+b,0)) % 10;
    return c11 === d[10];
  }

  // Vergi Kimlik No (10 digit + algorithm)
  function isValidVKN(s) {
    if (typeof s !== 'string') s = String(s ?? '');
    s = s.trim();
    if (!/^\d{10}$/.test(s)) return false;
    const v = [];
    for (let i = 0; i < 9; i++) {
      const tmp = (Number(s[i]) + (9 - i)) % 10;
      if (tmp === 0) { v.push(0); continue; }
      v.push((tmp * Math.pow(2, 9 - i)) % 9 || 9);
    }
    const sum = v.reduce((a,b)=>a+b,0);
    const check = (10 - (sum % 10)) % 10;
    return check === Number(s[9]);
  }

  function isValidTCorVKN(s) { return isValidTC(s) || isValidVKN(s); }

  // Küpe: TR + 12 to 14 digits (Turkey ear tag is flexible)
  function isValidKupe(s) {
    if (typeof s !== 'string') s = String(s ?? '');
    s = s.trim().toUpperCase().replace(/\s+/g, '');
    return /^TR\d{12,14}$/.test(s);
  }

  // Turkish mobile phone
  function isValidPhoneTR(s) {
    if (typeof s !== 'string') s = String(s ?? '');
    const digits = s.replace(/\D/g, '');
    // 5XXXXXXXXX (10) or 05XXXXXXXXX (11) or 905XXXXXXXXX (12)
    if (/^5\d{9}$/.test(digits)) return true;
    if (/^05\d{9}$/.test(digits)) return true;
    if (/^905\d{9}$/.test(digits)) return true;
    return false;
  }

  // Email
  function isValidEmail(s) {
    if (typeof s !== 'string') s = String(s ?? '');
    return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(s.trim());
  }

  // GPS in Turkey: lat 35.5–42.5, lon 25.5–45.0
  function isValidGPS_TR(s) {
    if (typeof s !== 'string') s = String(s ?? '');
    const m = s.trim().split(/[\s,;]+/).filter(Boolean);
    if (m.length !== 2) return false;
    const lat = parseFloat(m[0]), lon = parseFloat(m[1]);
    if (!isFinite(lat) || !isFinite(lon)) return false;
    if (lat < 35.5 || lat > 42.5) return false;
    if (lon < 25.5 || lon > 45.0) return false;
    return true;
  }

  function normalizePhoneTR(s) {
    if (!s) return '';
    const d = String(s).replace(/\D/g, '');
    let m = d;
    if (m.startsWith('90')) m = m.slice(2);
    if (m.length === 10 && m.startsWith('5')) m = '0' + m;
    if (m.length === 11) return `${m.slice(0,4)} ${m.slice(4,7)} ${m.slice(7,9)} ${m.slice(9,11)}`;
    return s;
  }

  // Phone → canonical DB form "05XXXXXXXXX" (11 digits) or '' if invalid
  function phoneToDB(s) {
    if (!s) return '';
    let d = String(s).replace(/\D/g, '');
    if (d.startsWith('90')) d = d.slice(2);
    if (d.length === 10 && d.startsWith('5')) d = '0' + d;
    return /^05\d{9}$/.test(d) ? d : '';
  }

  function normalizeKupe(s) {
    if (!s) return '';
    return String(s).trim().toUpperCase().replace(/\s+/g, '');
  }

  // Strip invalid chars from a number input as user types
  // opts: { integer: bool, allow_negative: bool }
  function filterNumberString(raw, opts) {
    opts = opts || {};
    let s = String(raw == null ? '' : raw);
    // Turkish/European decimal comma → dot
    s = s.replace(/,/g, '.');
    // Allow leading minus if allowed
    let neg = false;
    if (opts.allow_negative && s.trim().startsWith('-')) neg = true;
    // Strip everything except digits and dots
    s = s.replace(/[^0-9.]/g, '');
    // At most one dot
    const parts = s.split('.');
    if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
    // Integer mode: drop decimal portion
    if (opts.integer) s = s.split('.')[0];
    // Strip leading zeros (except "0" or "0.x")
    if (s.length > 1 && s.startsWith('0') && !s.startsWith('0.')) s = s.replace(/^0+/, '') || '0';
    return (neg ? '-' : '') + s;
  }

  // Parse normalized string → number (or null if empty/invalid)
  function parseNumberSafe(s) {
    if (s === '' || s === '-' || s == null) return null;
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  // Pretty-format a number for display with Turkish thousand separators
  function formatTR(n, decimals) {
    if (n == null || !isFinite(n)) return '';
    return Number(n).toLocaleString('tr-TR', { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 });
  }

  // Clamp a number to min/max if defined
  function clampNumber(n, min, max) {
    if (n == null || !isFinite(n)) return n;
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  }

  // Map of custom validator id → fn (used by frontend)
  const VALIDATORS = {
    tc: isValidTC,
    vkn: isValidVKN,
    tc_or_vkn: isValidTCorVKN,
    kupe_tr: isValidKupe,
    phone_tr: isValidPhoneTR,
    email: isValidEmail,
    gps_tr: isValidGPS_TR,
  };

  global.DMValidators = {
    isValidTC, isValidVKN, isValidTCorVKN, isValidKupe,
    isValidPhoneTR, isValidEmail, isValidGPS_TR,
    normalizePhoneTR, normalizeKupe, phoneToDB,
    filterNumberString, parseNumberSafe, formatTR, clampNumber,
    VALIDATORS,
    // Generic: return {ok, msg} for a question + value
    validate(q, value) {
      if (value === '' || value === null || value === undefined) return { ok: true };
      if (Array.isArray(value) && value.length === 0) return { ok: true };
      const v = q.validation || {};
      // min/max for numbers
      if (q.type === 'number' || q.type === 'year') {
        const n = Number(value);
        if (!isFinite(n)) return { ok: false, msg: 'Geçerli bir sayı giriniz' };
        if (v.min != null && n < v.min) return { ok: false, msg: `En az ${v.min} olmalı` };
        if (v.max != null && n > v.max) return { ok: false, msg: `En fazla ${v.max} olabilir` };
        if (q.min != null && n < q.min) return { ok: false, msg: `En az ${q.min} olmalı` };
        if (q.max != null && n > q.max) return { ok: false, msg: `En fazla ${q.max} olabilir` };
      }
      if (v.custom && VALIDATORS[v.custom]) {
        if (!VALIDATORS[v.custom](value)) {
          const msgs = {
            tc: 'Geçersiz TC kimlik numarası (11 hane + algoritma)',
            vkn: 'Geçersiz vergi numarası (10 hane + algoritma)',
            tc_or_vkn: 'Geçersiz TC (11 hane) veya VKN (10 hane)',
            kupe_tr: 'Geçersiz küpe formatı (TR + 12-14 hane, örn: TR042234567890)',
            phone_tr: 'Geçersiz telefon (05XX XXX XX XX formatı)',
            email: 'Geçersiz e-posta adresi',
            gps_tr: 'Geçersiz koordinat (Türkiye sınırları içinde olmalı, örn: 37.5762, 32.5421)',
          };
          return { ok: false, msg: msgs[v.custom] || 'Geçersiz değer' };
        }
      }
      return { ok: true };
    }
  };
})(window);
