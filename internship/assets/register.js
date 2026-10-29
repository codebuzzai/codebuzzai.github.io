/* Registration form — student or Student Ambassador, validation, dependent dropdowns, 2-week period, API submit */
(function () {
  var CFG = window.CB_INTERNSHIP || {};
  var OTHERS = 'Others';

  /* ---------- Degree → duration (years) and courses ---------- */
  var DEGREES = {
    'Diploma':           { years: 3, courses: ['Computer Engineering', 'Information Technology', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Automobile Engineering'] },
    'B.E':               { years: 4, courses: ['Computer Science & Engineering', 'CSE (Artificial Intelligence & Machine Learning)', 'CSE (Data Science)', 'CSE (Cyber Security)', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Electronics & Instrumentation Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Civil Engineering', 'Biomedical Engineering'] },
    'B.Tech':            { years: 4, courses: ['Information Technology', 'Artificial Intelligence & Data Science', 'Artificial Intelligence & Machine Learning', 'Computer Science & Engineering', 'Computer Science & Business Systems', 'Electronics & Communication Engineering', 'Biotechnology', 'Chemical Engineering'] },
    'B.Sc':              { years: 3, courses: ['Computer Science', 'Information Technology', 'Computer Science with Artificial Intelligence', 'Data Science', 'Mathematics', 'Physics', 'Electronics', 'Statistics'] },
    'BCA':               { years: 3, courses: ['Computer Applications', 'Computer Applications (Data Science)', 'Computer Applications (Cloud Computing)'] },
    'B.Com':             { years: 3, courses: ['Computer Applications', 'General', 'Accounting & Finance', 'Business Analytics'] },
    'BBA':               { years: 3, courses: ['General', 'Business Analytics', 'Computer Applications'] },
    'M.E':               { years: 2, courses: ['Computer Science & Engineering', 'Software Engineering', 'Communication Systems', 'VLSI Design', 'Embedded Systems'] },
    'M.Tech':            { years: 2, courses: ['Computer Science & Engineering', 'Information Technology', 'Data Science', 'Artificial Intelligence', 'VLSI Design'] },
    'M.Sc':              { years: 2, courses: ['Computer Science', 'Information Technology', 'Data Science', 'Artificial Intelligence & Machine Learning', 'Mathematics', 'Physics'] },
    'Integrated M.Sc':   { years: 5, courses: ['Software Systems', 'Computer Science', 'Data Science', 'Theoretical Computer Science'] },
    'MCA':               { years: 2, courses: ['Computer Applications'] },
    'MBA':               { years: 2, courses: ['Business Analytics', 'Systems / IT', 'Finance', 'Marketing', 'Human Resources', 'General'] }
  };
  var ORD = ['1st', '2nd', '3rd', '4th', '5th'];

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function nice(d) { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function opt(value, label) { var o = document.createElement('option'); o.value = value; o.textContent = label || value; return o; }
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  var form = $('regForm'), degree = $('degree'), course = $('course'), year = $('year');
  var degreeOther = $('degreeOther'), courseOther = $('courseOther');
  var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  /* ---------- Degree dropdown ---------- */
  Object.keys(DEGREES).forEach(function (d) { degree.appendChild(opt(d)); });
  degree.appendChild(opt(OTHERS));

  function showWrap(id, show) { $(id).classList.toggle('open', show); }

  degree.addEventListener('change', function () {
    var d = degree.value, info = DEGREES[d];
    // Courses
    course.innerHTML = '';
    showWrap('courseOtherWrap', false); courseOther.value = '';
    if (!d) {
      course.appendChild(opt('', 'Select your degree first')); course.disabled = true;
    } else if (d === OTHERS) {
      course.appendChild(opt(OTHERS, 'Others (enter below)')); course.value = OTHERS; course.disabled = true;
      showWrap('courseOtherWrap', true);
    } else {
      course.appendChild(opt('', 'Select your course'));
      info.courses.forEach(function (c) { course.appendChild(opt(c)); });
      course.appendChild(opt(OTHERS));
      course.disabled = false;
    }
    showWrap('degreeOtherWrap', d === OTHERS);
    if (d !== OTHERS) degreeOther.value = '';

    // Years — based on the degree's duration
    var n = info ? info.years : 5;
    year.innerHTML = '';
    if (!d) { year.appendChild(opt('', 'Select your degree first')); year.disabled = true; }
    else {
      year.appendChild(opt('', 'Select your year'));
      for (var i = 1; i <= n; i++) {
        year.appendChild(opt(String(i), ORD[i - 1] + ' year' + (info && i === n ? ' (final year)' : '')));
      }
      year.disabled = false;
    }
    clearErr(degree); clearErr(course); clearErr(year);
  });

  course.addEventListener('change', function () {
    showWrap('courseOtherWrap', course.value === OTHERS);
    if (course.value !== OTHERS) courseOther.value = '';
  });

  /* ---------- Date limits ---------- */
  var dob = $('dob');
  dob.max = toISO(new Date(today.getFullYear() - 15, today.getMonth(), today.getDate()));
  dob.min = toISO(new Date(today.getFullYear() - 60, today.getMonth(), today.getDate()));

  /* ---------- Internship dates: a batch now, or "choose date later" (picked in the portal) ---------- */
  var DAYS = CFG.internshipDays || 14;
  var batch = $('batch');

  // Scheduled batches that haven't started yet
  batch.appendChild(opt('', 'Select a batch'));
  (CFG.batches || []).forEach(function (s, i) {
    var start = fromISO(s), end = addDays(start, DAYS - 1);
    var o = opt(s, 'Batch ' + pad(i + 1) + ' · ' + nice(start) + ' → ' + nice(end));
    if (start <= today) { o.disabled = true; o.textContent += ' (closed)'; }
    batch.appendChild(o);
  });

  function mode() { return form.querySelector('input[name="dateMode"]:checked').value; }
  function startValue() { return mode() === 'later' ? '' : batch.value; }

  function syncPeriod() {
    var s = startValue();
    if (!s) { $('periodNote').hidden = true; return; }
    var start = fromISO(s), end = addDays(start, DAYS - 1);
    $('periodText').textContent = 'Your internship: ' + nice(start) + ' → ' + nice(end) + ' (2 weeks)';
    $('periodNote').hidden = false;
  }

  /* ---------- Certificate hard copy + fee breakup ---------- */
  var PRICE = { fee: CFG.feeInr || 1999, hardcopy: CFG.hardcopyFeeInr || 150 };
  var hardcopy = $('hardcopy');
  function rs(n) { return '\u20b9' + Number(n).toLocaleString('en-IN'); }
  function syncBreakup() {
    var later = mode() === 'later';
    document.querySelectorAll('[data-hardcopy-fee]').forEach(function (e) { e.textContent = PRICE.hardcopy; });
    var hc = hardcopy.checked;
    $('bkFee').textContent = rs(PRICE.fee);
    $('bkHc').textContent = rs(PRICE.hardcopy);
    $('bkHcRow').hidden = !hc;
    $('bkTotal').textContent = rs(PRICE.fee + (hc ? PRICE.hardcopy : 0));
    $('bkNote').textContent = later
      ? 'On the next page you can pay now, or skip and pay later from your student portal. The internship fee is non-refundable.'
      : 'You\u2019ll pay on the next page. The internship fee is non-refundable.';
  }
  hardcopy.addEventListener('change', syncBreakup);
  // Prices come from the server; config.js values are only a fallback
  fetch(CFG.apiBase + '/api/internship/pricing').then(function (r) { return r.json(); }).then(function (d) {
    if (d.feeInr) PRICE.fee = d.feeInr;
    if (d.hardcopyFeeInr) PRICE.hardcopy = d.hardcopyFeeInr;
    syncBreakup();
  }).catch(function () {});

  function syncMode() {
    var later = mode() === 'later';
    showWrap('scheduledWrap', !later);
    $('laterNote').hidden = !later;
    clearErr(batch);
    syncPeriod();
    syncBreakup();
    $('nextHint').textContent = later ? 'Next: pay now or skip for later' : 'Next: payment';
  }

  form.querySelectorAll('input[name="dateMode"]').forEach(function (r) { r.addEventListener('change', syncMode); });
  batch.addEventListener('change', syncPeriod);

  /* ---------- How did you hear about us ---------- */
  var heardFrom = $('heardFrom');
  heardFrom.addEventListener('change', function () {
    showWrap('heardOtherWrap', heardFrom.value === 'other');
    if (heardFrom.value !== 'other') $('heardFromOther').value = '';
  });

  // Pre-select the batch chosen on the landing page (register.html?start=YYYY-MM-DD)
  var startParam = new URLSearchParams(location.search).get('start');
  var picked = startParam && batch.querySelector('option[value="' + startParam.replace(/[^\d-]/g, '') + '"]');
  if (picked && !picked.disabled) batch.value = startParam;
  if (new URLSearchParams(location.search).get('dates') === 'later') form.querySelector('input[name="dateMode"][value="later"]').checked = true;
  syncMode(); // also restores the right view if the browser kept "Choose date later" checked on back/refresh
  // (the Student / Ambassador view is applied further down, once validation helpers exist)

  /* ---------- Phone: digits only ---------- */
  var phone = $('phone');
  // Accepts pasted numbers like "+91 98765 43210" or "098765 43210"
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (d.length > 10) d = d.replace(/^(91|0)/, '');
    phone.value = d.slice(0, 10);
  });

  /* ---------- Referral code (optional): prefill from ?ref=, live check ---------- */
  var REF_RE = /^[A-Z]{1,6}-[A-Z0-9]{5}$/;
  var refInput = $('referralCode'), refStatus = $('refStatus'), refTimer = null;
  var refParam = new URLSearchParams(location.search).get('ref');
  if (refParam) refInput.value = refParam.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
  function checkRef() {
    var v = refInput.value.trim().toUpperCase();
    refStatus.textContent = ''; refStatus.className = 'ref-status';
    if (!v || !REF_RE.test(v)) return;
    fetch(CFG.apiBase + '/api/internship/referral-codes/' + encodeURIComponent(v))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (refInput.value.trim().toUpperCase() !== v) return;
        if (d.valid) { refStatus.textContent = '\u2713 Referred by ' + d.name; refStatus.className = 'ref-status ok'; setErr(refInput, false); }
        else { refStatus.textContent = 'We couldn\u2019t find this referral code.'; refStatus.className = 'ref-status bad'; }
      })
      .catch(function () {});
  }
  refInput.addEventListener('input', function () { clearTimeout(refTimer); refTimer = setTimeout(checkRef, 450); });
  if (refInput.value) setTimeout(checkRef, 300);

  /* ---------- Student or Student Ambassador ---------- */
  var COMMON = ['fullName', 'email', 'phone'];      // the only fields an ambassador fills in
  function isAmb() { return form.querySelector('input[name="participantType"]:checked').value === 'ambassador'; }
  var TEXT = {
    student: {
      title: 'Register for the <span class="grad">internship</span>',
      intro: 'Fill in your details below. Fields marked * are mandatory. It takes about two minutes.',
      step2: 'Payment', step3: 'Student login', submit: 'Register now', next: 'Next: payment',
      consent: 'I confirm that the details above are correct, and I agree to the <a href="terms.html" target="_blank" rel="noopener" style="color:var(--brand)">Terms &amp; Conditions</a>, including that the internship fee is non-refundable.'
    },
    ambassador: {
      title: 'Become a <span class="grad">Student Ambassador</span>',
      intro: 'For alumni who want to help their juniors. Three details, no fee — and ₹' + (CFG.referralRewardInr || 100) + ' for every junior who joins.',
      step2: 'Referral code', step3: 'Your portal', submit: 'Join as ambassador', next: 'No fee for ambassadors',
      consent: 'I confirm that the details above are correct, and I agree to the <a href="terms.html" target="_blank" rel="noopener" style="color:var(--brand)">Terms &amp; Conditions</a> for Student Ambassadors.'
    }
  };
  function syncType() {
    var amb = isAmb(), t = TEXT[amb ? 'ambassador' : 'student'];
    form.querySelectorAll('[data-student]').forEach(function (el) { el.hidden = amb; });
    $('ambNote').hidden = !amb;
    $('stuInfo').hidden = amb; $('ambInfo').hidden = !amb;
    $('pageTitle').innerHTML = t.title; $('pageIntro').textContent = t.intro;
    $('step2').textContent = t.step2; $('step3').textContent = t.step3;
    $('submitLabel').textContent = t.submit; $('nextHint').textContent = t.next; $('consentText').innerHTML = t.consent;
    $('fullName').placeholder = amb ? 'Your full name' : 'As on your college ID';
    if (!amb) syncMode();
    form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
    $('formError').classList.remove('show');
  }
  form.querySelectorAll('input[name="participantType"]').forEach(function (r) { r.addEventListener('change', syncType); });
  if (new URLSearchParams(location.search).get('type') === 'ambassador') {
    form.querySelector('input[name="participantType"][value="ambassador"]').checked = true;
  }

  /* ---------- Validation ---------- */
  var NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,99}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[6-9]\d{9}$/;

  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el, bad) { var f = fieldOf(el); if (f) f.classList.toggle('invalid', bad); return !bad; }
  function clearErr(el) { setErr(el, false); }

  function inRange(v, min, max) { return v && v >= min && v <= max; }

  var checks = {
    fullName:    function () { return NAME_RE.test(clean($('fullName').value)); },
    fatherName:  function () { return NAME_RE.test(clean($('fatherName').value)); },
    dob:         function () { return inRange(dob.value, dob.min, dob.max); },
    email:       function () { return EMAIL_RE.test($('email').value.trim()); },
    phone:       function () { return PHONE_RE.test(phone.value); },
    college:     function () { return clean($('college').value).length >= 3; },
    degree:      function () { return !!degree.value; },
    degreeOther: function () { return degree.value !== OTHERS || clean(degreeOther.value).length >= 2; },
    course:      function () { return !!course.value; },
    courseOther: function () { return course.value !== OTHERS || clean(courseOther.value).length >= 2; },
    year:        function () { return !!year.value; },
    address:     function () { return clean($('address').value).length >= 10; },
    referralCode: function () { var v = refInput.value.trim(); return !v || REF_RE.test(v.toUpperCase()); },
    batch:       function () { return mode() === 'later' || (!!batch.value && !batch.selectedOptions[0].disabled); },
    heardFrom:   function () { return !!heardFrom.value; }
  };

  function activeChecks() { return Object.keys(checks).filter(function (id) { return !isAmb() || COMMON.indexOf(id) >= 0; }); }
  function validateField(id) { return setErr($(id), !checks[id]()); }

  Object.keys(checks).forEach(function (id) {
    var el = $(id);
    el.addEventListener('blur', function () { if (el.value) validateField(id); });
    el.addEventListener('input', function () { if (fieldOf(el).classList.contains('invalid')) validateField(id); });
    el.addEventListener('change', function () { if (fieldOf(el).classList.contains('invalid')) validateField(id); });
  });

  var consent = $('consent');
  consent.addEventListener('change', function () { $('consentWrap').classList.toggle('invalid', !consent.checked); });

  // Hide the summary error once every highlighted field has been fixed
  form.addEventListener('input', hideErrorIfClean);
  form.addEventListener('change', hideErrorIfClean);
  function hideErrorIfClean() {
    if (!form.querySelector('.field.invalid, .consent.invalid')) $('formError').classList.remove('show');
  }

  /* ---------- Submit ---------- */
  var btn = $('submitBtn'), errBox = $('formError');
  function showError(msg) { errBox.textContent = msg; errBox.classList.add('show'); }
  function setLoading(on) {
    btn.disabled = on; btn.classList.toggle('loading', on);
    $('submitLabel').textContent = on ? 'Registering…' : TEXT[isAmb() ? 'ambassador' : 'student'].submit;
  }

  function copyText(text, btnEl, label) {
    var done = function () { btnEl.textContent = 'Copied'; setTimeout(function () { btnEl.textContent = label; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  }

  // Ambassadors stay on this page and see their referral code straight away
  function showAmbassadorDone(d, payload) {
    var link = location.origin + location.pathname + '?ref=' + encodeURIComponent(d.referralCode);
    $('adName').textContent = payload.fullName.split(' ')[0];
    $('adEmail').textContent = payload.email;
    $('adCode').textContent = d.referralCode;
    $('adId').textContent = d.registrationId;
    if (d.referralRewardInr) $('adReward').textContent = d.referralRewardInr;
    $('adCopyCode').onclick = function () { copyText(d.referralCode, $('adCopyCode'), 'Copy'); };
    $('adCopyLink').onclick = function () { copyText(link, $('adCopyLink'), 'Copy share link'); };
    $('adWhatsApp').href = 'https://wa.me/?text=' + encodeURIComponent('Join the CodeBuzz AI Internship Program — 2 weeks of programming, system design, AI basics and hands-on coding, with a certificate. Use my referral code ' + d.referralCode + ' when you register: ' + link);
    form.hidden = true;
    $('ambDone').hidden = false;
    document.querySelectorAll('.stepper .st')[0].className = 'st done';
    document.querySelectorAll('.stepper .st b')[0].textContent = '\u2713';
    document.querySelectorAll('.stepper .st')[1].className = 'st active';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.classList.remove('show');

    var amb = isAmb();
    var ok = true, first = null;
    activeChecks().forEach(function (id) {
      var good = validateField(id);
      if (!good && !first) first = $(id);
      ok = ok && good;
    });
    if (!consent.checked) { $('consentWrap').classList.add('invalid'); ok = false; if (!first) first = consent; }
    if (!ok) {
      showError('Please fix the highlighted fields.');
      if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { first.focus({ preventScroll: true }); }, 400); }
      return;
    }
    if (!amb) syncPeriod();

    var payload = amb ? {
      participantType: 'ambassador',
      fullName:       clean($('fullName').value),
      email:          $('email').value.trim().toLowerCase(),
      phone:          phone.value,
      consent:        true
    } : {
      participantType: 'student',
      fullName:       clean($('fullName').value),
      fatherName:     clean($('fatherName').value),
      dateOfBirth:    dob.value,
      email:          $('email').value.trim().toLowerCase(),
      phone:          phone.value,
      college:        clean($('college').value),
      degree:         degree.value === OTHERS ? clean(degreeOther.value) : degree.value,
      degreeIsOther:  degree.value === OTHERS,
      course:         course.value === OTHERS ? clean(courseOther.value) : course.value,
      courseIsOther:  course.value === OTHERS,
      collegeYear:    +year.value,
      homeAddress:    $('address').value.trim(),
      internshipFrom: startValue(),
      dateMode:       mode(),
      certificateHardcopy: hardcopy.checked,
      referralCode:   refInput.value.trim().toUpperCase(),
      heardFrom:      heardFrom.value,
      heardFromOther: heardFrom.value === 'other' ? clean($('heardFromOther').value) : '',
      consent:        true
    };

    setLoading(true);
    fetch(CFG.apiBase + '/api/internship/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { res: res, data: data }; });
      })
      .then(function (r) {
        if (r.res.ok && r.data.registrationId && amb) {
          if (window.cbTrack) cbTrack('Lead', { content_name: 'Student Ambassador' });
          showAmbassadorDone(r.data, payload);
          return;
        }
        if (r.res.ok && r.data.registrationId) {
          try { sessionStorage.setItem('cbi_reg_id', r.data.registrationId); } catch (_) {}
          var next = 'payment.html?id=' + encodeURIComponent(r.data.registrationId);
          if (window.cbTrack) {
            cbTrack('CompleteRegistration', { content_name: 'CodeBuzz AI Internship' });
            setTimeout(function () { window.location.href = next; }, 300); // let the pixel request leave first
          } else {
            window.location.href = next;
          }
          return;
        }
        if (r.data.errors) {
          Object.keys(r.data.errors).forEach(function (k) { var el = $(k); if (el) setErr(el, true); });
        }
        showError(r.data.message || 'Something went wrong. Please try again.');
        setLoading(false);
      })
      .catch(function () {
        showError('We couldn’t reach the registration server. Please check your connection and try again.');
        setLoading(false);
      });
  });
  syncType();
})();
