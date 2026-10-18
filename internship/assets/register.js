/* Registration form — validation, dependent dropdowns, 2-week period, API submit */
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
  var fromDate = $('fromDate'), toDate = $('toDate');
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

  var minStart = addDays(today, 1), maxStart = addDays(today, 365);
  fromDate.min = toISO(minStart);
  fromDate.max = toISO(maxStart);

  var DAYS = CFG.internshipDays || 14;
  function syncPeriod() {
    if (!fromDate.value) { toDate.value = ''; $('periodNote').hidden = true; return; }
    var start = fromISO(fromDate.value), end = addDays(start, DAYS - 1);
    toDate.value = toISO(end);
    toDate.min = toDate.max = toISO(end);
    $('periodText').textContent = 'Your internship: ' + nice(start) + ' → ' + nice(end) + ' (2 weeks)';
    $('periodNote').hidden = false;
  }
  fromDate.addEventListener('change', syncPeriod);
  fromDate.addEventListener('input', syncPeriod);

  /* ---------- Phone: digits only ---------- */
  var phone = $('phone');
  // Accepts pasted numbers like "+91 98765 43210" or "098765 43210"
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (d.length > 10) d = d.replace(/^(91|0)/, '');
    phone.value = d.slice(0, 10);
  });

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
    fromDate:    function () { return inRange(fromDate.value, fromDate.min, fromDate.max); }
  };

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
    if (!form.querySelector('.field.invalid') && !$('consentWrap').classList.contains('invalid')) $('formError').classList.remove('show');
  }

  /* ---------- Submit ---------- */
  var btn = $('submitBtn'), errBox = $('formError');
  function showError(msg) { errBox.textContent = msg; errBox.classList.add('show'); }
  function setLoading(on) {
    btn.disabled = on; btn.classList.toggle('loading', on);
    $('submitLabel').textContent = on ? 'Registering…' : 'Register now';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.classList.remove('show');

    var ok = true, first = null;
    Object.keys(checks).forEach(function (id) {
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
    syncPeriod();

    var payload = {
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
      internshipFrom: fromDate.value,
      internshipTo:   toDate.value,
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
        if (r.res.ok && r.data.registrationId) {
          try { sessionStorage.setItem('cbi_reg_id', r.data.registrationId); } catch (_) {}
          if (window.gtag) gtag('event', 'internship_registered');
          window.location.href = 'payment.html?id=' + encodeURIComponent(r.data.registrationId);
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
})();
