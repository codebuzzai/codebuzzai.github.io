/* Shared helpers for the student and admin portals */
(function () {
  var CFG = window.CB_INTERNSHIP || {};
  // Tokens live in sessionStorage: closing the tab logs out (safer on shared college lab computers)
  var KEYS = { student: 'cbi_student_token', admin: 'cbi_admin_token' };

  function store(kind, token) {
    try { if (token) sessionStorage.setItem(KEYS[kind], token); else sessionStorage.removeItem(KEYS[kind]); } catch (_) {}
  }
  function token(kind) { try { return sessionStorage.getItem(KEYS[kind]) || ''; } catch (_) { return ''; } }

  // api('/auth/login', { method: 'POST', body: {...}, auth: 'student' }) → Promise<{ ok, status, data }>
  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    if (opts.auth && token(opts.auth)) headers.Authorization = 'Bearer ' + token(opts.auth);
    return fetch(CFG.apiBase + '/api/internship' + path, {
      method: opts.method || (opts.body ? 'POST' : 'GET'),
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 && opts.auth && !opts.noRedirect) {
          store(opts.auth, '');
          location.href = opts.auth === 'admin' ? 'admin.html' : 'login.html?expired=1';
        }
        return { ok: r.ok, status: r.status, data: d };
      });
    }, function () {
      return { ok: false, status: 0, data: { message: 'Can’t reach the server. Check your internet connection and try again.' } };
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function date(s) {
    if (!s) return '';
    var p = s.slice(0, 10).split('-');
    var out = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return s.length > 10 ? out + ', ' + s.slice(11, 16) : out;
  }
  function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }
  function copy(text, btn, label) {
    var done = function () { if (btn) { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label || 'Copy'; }, 1500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  }
  // Show/hide password buttons
  function wirePasswordToggles(root) {
    (root || document).querySelectorAll('.pw-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = b.parentNode.querySelector('input');
        var show = i.type === 'password';
        i.type = show ? 'text' : 'password';
        b.textContent = show ? 'Hide' : 'Show';
      });
    });
  }
  function msg(el, text, kind) {
    el.textContent = text || '';
    el.className = 'msg' + (text ? ' show ' + (kind || 'err') : '');
  }
  function busy(btn, on, label) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = on;
    btn.textContent = on ? (label || 'Please wait…') : btn.dataset.label;
  }
  var PW_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

  window.Portal = { api: api, store: store, token: token, esc: esc, date: date, inr: inr, copy: copy,
    wirePasswordToggles: wirePasswordToggles, msg: msg, busy: busy, PW_RULE: PW_RULE, CFG: CFG };
})();
