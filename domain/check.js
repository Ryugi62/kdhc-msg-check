// 순수 판정 함수 — DOM·네트워크·저장 없음.
(function (root) {
  var PHONE_RE = /(?:\+?82[-\s]?)?(?:0\d{1,2}|1\d{3})[-\s.]?\d{3,4}(?:[-\s.]?\d{4})?/g;
  var URL_RE = /(?:https?:\/\/)?(?:[A-Za-z0-9가-힣-]+\.)+[A-Za-z]{2,}(?:[\/:?#][^\s<>"'，。]*)?/gi;

  function digits(s) { return String(s).replace(/\D/g, ''); }

  function normalizePhone(s) {
    var d = digits(s);
    if (d.indexOf('82') === 0 && d.length > 10) d = '0' + d.slice(2);
    return d;
  }

  function hostOf(token) {
    var t = String(token).trim().replace(/[)\].,;!?]+$/, '');
    var rest = t.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    var authority = rest.split(/[\/?#]/)[0];
    var at = authority.lastIndexOf('@');
    if (at >= 0) authority = authority.slice(at + 1);
    authority = authority.replace(/:\d+$/, '').replace(/\.+$/, '').toLowerCase();
    return authority;
  }

  function extractPhones(text) {
    var out = [], m, seen = {};
    PHONE_RE.lastIndex = 0;
    while ((m = PHONE_RE.exec(text)) !== null) {
      var n = normalizePhone(m[0]);
      if (n.length < 8 || n.length > 11) continue;
      if (!seen[n]) { seen[n] = 1; out.push({ kind: 'phone', raw: m[0].trim(), key: n }); }
    }
    return out;
  }

  function extractHosts(text) {
    var out = [], m, seen = {};
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(text)) !== null) {
      var raw = m[0];
      var h = hostOf(raw);
      if (!/\.[a-z]{2,}$/.test(h)) continue;
      var hasScheme = /^https?:\/\//i.test(raw);
      var key = h;
      if (!seen[key]) { seen[key] = 1; out.push({ kind: 'host', raw: raw.replace(/[)\].,;!?]+$/, ''), key: key, link: hasScheme || /[\/?#]/.test(raw) }); }
    }
    return out;
  }

  var NAME_RE = /한난|한국지역난방공사|지역난방/;

  // opts.scheduled = 이번 달 공사 직접 연락 예정 건수(기본 0). 0건인 달에 한난 이름이 든 연락은 번호가 맞아도 예정에 없는 연락.
  function judge(text, list, opts) {
    var scheduled = opts && typeof opts.scheduled === 'number' ? opts.scheduled : 0;
    var named = NAME_RE.test(text || '');
    var phones = extractPhones(text || '');
    var hosts = extractHosts(text || '');
    var okPhones = {}, okHosts = {};
    list.phones.forEach(function (p) { okPhones[normalizePhone(p.value)] = p; });
    list.hosts.forEach(function (h) { okHosts[h.value.toLowerCase()] = h; });
    var findings = [];
    phones.forEach(function (f) {
      var hit = okPhones[f.key];
      findings.push({ kind: 'phone', raw: f.raw, listed: !!hit, entry: hit || null });
    });
    var hasLink = false;
    hosts.forEach(function (f) {
      var hit = okHosts[f.key];
      if (f.link) hasLink = true;
      findings.push({ kind: 'host', raw: f.raw, host: f.key, listed: !!hit, entry: hit || null });
    });
    var verdict = (named && scheduled === 0) ? 'unscheduled'
      : findings.length === 0 ? 'empty'
      : findings.every(function (f) { return f.listed; }) ? 'match' : 'unlisted';
    return { verdict: verdict, findings: findings, hasLink: hasLink, named: named, scheduled: scheduled };
  }

  var api = { judge: judge, extractPhones: extractPhones, extractHosts: extractHosts, normalizePhone: normalizePhone, hostOf: hostOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KdhcCheck = api;
})(typeof self !== 'undefined' ? self : this);
