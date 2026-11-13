/* Job application form: validates, reads the resume, and posts to the API, which emails it to the team. */
(function () {
  var form = document.getElementById('applyForm');
  if (!form) return;
  var CFG = window.CB_INTERNSHIP || {};
  var API = (CFG.apiBase || '') + '/api/careers/apply';
  var MAX = 2 * 1024 * 1024;
  var btn = document.getElementById('submitBtn'), msg = document.getElementById('formMsg');
  var fileInput = document.getElementById('resume'), fileText = document.getElementById('resumeText');
  var resume = null;   // { filename, contentType, data }

  function err(name, text) {
    var el = form.querySelector('[data-for="' + name + '"]');
    if (el) el.textContent = text || '';
    var input = form.elements[name];
    if (input && input.classList) input.classList.toggle('form-error', !!text);
  }
  function clearErrors() { form.querySelectorAll('.c-err').forEach(function (e) { e.textContent = ''; }); form.querySelectorAll('.form-error').forEach(function (e) { e.classList.remove('form-error'); }); msg.textContent = ''; }
  function sizeText(n) { return n < 1024 * 1024 ? Math.round(n / 1024) + ' KB' : (n / 1024 / 1024).toFixed(1) + ' MB'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  fileInput.addEventListener('change', function () {
    resume = null; err('resume', '');
    var f = fileInput.files && fileInput.files[0];
    fileInput.closest('.c-file').classList.remove('has-file');
    if (!f) { fileText.innerHTML = '<b>Choose a file</b> &middot; PDF or Word, up to 2 MB'; return; }
    var ext = (f.name.split('.').pop() || '').toLowerCase();
    if (['pdf', 'doc', 'docx'].indexOf(ext) < 0) { fileInput.value = ''; return err('resume', 'Upload a PDF or Word file.'); }
    if (f.size > MAX) { fileInput.value = ''; return err('resume', 'This file is ' + sizeText(f.size) + '. The limit is 2 MB.'); }
    var reader = new FileReader();
    reader.onload = function () {
      var data = String(reader.result || '');
      resume = { filename: f.name, contentType: f.type || '', data: data.slice(data.indexOf(',') + 1) };
      fileText.innerHTML = '<b>' + esc(f.name) + '</b> &middot; ' + sizeText(f.size) + ' &middot; <u>change</u>';
      fileInput.closest('.c-file').classList.add('has-file');
    };
    reader.onerror = function () { err('resume', 'We couldn’t read this file. Please try another.'); };
    reader.readAsDataURL(f);
  });

  function collect() {
    var v = function (n) { return (form.elements[n].value || '').trim(); };
    return {
      jobId: v('jobId'), website: v('website'),
      fullName: v('fullName'), email: v('email'), phone: v('phone').replace(/[\s-]/g, ''), city: v('city'),
      experience: v('experience'), noticePeriod: v('noticePeriod'), currentCompany: v('currentCompany'), expectedCtc: v('expectedCtc'),
      languages: Array.prototype.slice.call(form.querySelectorAll('input[name="languages"]:checked')).map(function (c) { return c.value; }),
      linkedin: v('linkedin'), message: form.elements.message.value.trim(), consent: form.elements.consent.checked, resume: resume
    };
  }
  function check(d) {
    var bad = {};
    if (d.fullName.length < 2) bad.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) bad.email = 'Enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(d.phone.replace(/^\+?91/, ''))) bad.phone = 'Enter a valid 10-digit mobile number.';
    if (d.city.length < 2) bad.city = 'Enter your city.';
    if (!d.experience) bad.experience = 'Choose your experience.';
    if (!d.noticePeriod) bad.noticePeriod = 'Choose when you can join.';
    if (!d.languages.length) bad.languages = 'Choose at least one language.';
    if (d.linkedin && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i.test(d.linkedin)) bad.linkedin = 'Enter a full LinkedIn link (https://linkedin.com/in/...).';
    if (!d.resume) bad.resume = 'Upload your resume (PDF or Word, up to 2 MB).';
    if (!d.consent) bad.consent = 'Please agree so we can contact you.';
    return bad;
  }
  function showErrors(bad) {
    var first = null;
    Object.keys(bad).forEach(function (k) { err(k, bad[k]); if (!first) first = k; });
    var el = first && (form.elements[first] && form.elements[first].length === undefined ? form.elements[first] : form.querySelector('[data-for="' + first + '"]'));
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el && el.focus) el.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (btn.disabled) return;
    clearErrors();
    var d = collect(), bad = check(d);
    if (Object.keys(bad).length) { msg.textContent = 'Please fix the highlighted fields.'; return showErrors(bad); }
    btn.disabled = true; btn.textContent = 'Submitting…';
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, data: j }; }); })
      .then(function (r) {
        if (r.ok) {
          form.hidden = true;
          document.getElementById('applyDone').hidden = false;
          document.getElementById('apply').scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (window.cbTrack) cbTrack('SubmitApplication', { content_name: 'Sales Executive' });
          return;
        }
        btn.disabled = false; btn.textContent = 'Submit application';
        if (r.data && r.data.errors) showErrors(r.data.errors);
        msg.textContent = (r.data && r.data.message) || 'Something went wrong. Please try again.';
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Submit application';
        msg.innerHTML = 'We couldn’t reach our server. Check your internet and try again, or email your resume to <a href="mailto:info@codebuzz.ai">info@codebuzz.ai</a>.';
      });
  });
  // Clear a field's error as soon as the person fixes it
  form.addEventListener('input', function (ev) { if (ev.target.name) err(ev.target.name, ''); });
})();
