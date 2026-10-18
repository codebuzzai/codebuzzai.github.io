/* Landing page animations */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Typing code terminal ---------- */
  var LINES = [
    [['tk-c', '# your next two weeks']],
    [['tk-k', 'from'], ['', ' codebuzz '], ['tk-k', 'import'], ['', ' Internship']],
    [],
    [['', 'intern = '], ['tk-f', 'Internship'], ['', '(weeks='], ['tk-n', '2'], ['', ')']],
    [['', 'intern.'], ['tk-f', 'learn'], ['', '('], ['tk-s', '"Programming basics"'], ['', ')']],
    [['', 'intern.'], ['tk-f', 'learn'], ['', '('], ['tk-s', '"System design"'], ['', ')']],
    [['', 'intern.'], ['tk-f', 'learn'], ['', '('], ['tk-s', '"Basics of AI"'], ['', ')']],
    [['', 'intern.'], ['tk-f', 'build'], ['', '('], ['tk-s', '"Hands-on project"'], ['', ')']],
    [['', 'intern.'], ['tk-f', 'certify'], ['', '()']],
    [],
    [['tk-ok', '✓ Certificate unlocked. Welcome aboard!']]
  ];
  var box = document.getElementById('code');

  function renderAll() {
    box.innerHTML = '';
    LINES.forEach(function (segs) {
      var ln = document.createElement('div'); ln.className = 'ln';
      if (!segs.length) ln.innerHTML = '&nbsp;';
      segs.forEach(function (s) { var sp = document.createElement('span'); if (s[0]) sp.className = s[0]; sp.textContent = s[1]; ln.appendChild(sp); });
      box.appendChild(ln);
    });
    var c = document.createElement('span'); c.className = 'caret'; box.lastChild.appendChild(c);
  }

  function type() {
    box.innerHTML = '';
    var caret = document.createElement('span'); caret.className = 'caret';
    var li = 0, si = 0, ci = 0, line = null, span = null;
    function step() {
      if (li >= LINES.length) {
        setTimeout(function () { type(); }, 4200); // loop
        return;
      }
      var segs = LINES[li];
      if (!line) {
        line = document.createElement('div'); line.className = 'ln'; box.appendChild(line);
        if (!segs.length) { line.innerHTML = '&nbsp;'; line = null; li++; return setTimeout(step, 120); }
      }
      var seg = segs[si];
      if (!span) { span = document.createElement('span'); if (seg[0]) span.className = seg[0]; line.appendChild(span); }
      span.textContent += seg[1].charAt(ci++);
      line.appendChild(caret);
      if (ci >= seg[1].length) { ci = 0; si++; span = null; }
      if (si >= segs.length) { si = 0; li++; line = null; return setTimeout(step, 260); }
      setTimeout(step, 22 + Math.random() * 38);
    }
    setTimeout(step, 700);
  }
  if (box) { reduce ? renderAll() : type(); }

  /* ---------- Count-up stats ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = +el.getAttribute('data-count'), n = 0;
    if (reduce) { el.textContent = target; return; }
    setTimeout(function tick() { n++; el.textContent = n; if (n < target) setTimeout(tick, 260); }, 900);
  });

  /* ---------- 3D tilt on terminal + certificate ---------- */
  function tilt(el, max) {
    if (!el || reduce || window.matchMedia('(hover: none)').matches) return;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'rotateY(' + (x * max) + 'deg) rotateX(' + (-y * max) + 'deg)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  }
  tilt(document.getElementById('terminal'), 8);
  tilt(document.getElementById('cert'), 12);

  /* ---------- Spotlight on highlight cards ---------- */
  document.querySelectorAll('.hl').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Timeline fill on scroll ---------- */
  var tl = document.getElementById('timeline'), fill = document.getElementById('timelineFill');
  var items = tl ? tl.querySelectorAll('.tl-item') : [];
  function onScroll() {
    if (!tl) return;
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .6 - r.top) / r.height));
    fill.style.height = (p * 100) + '%';
    items.forEach(function (it) {
      var ir = it.getBoundingClientRect();
      it.classList.toggle('lit', ir.top < vh * .6);
    });
    // Sticky mobile CTA: show after hero, hide near the final CTA
    var cta = document.getElementById('stickyCta'), fin = document.getElementById('register');
    if (cta && fin) {
      var past = window.scrollY > vh * .8, nearEnd = fin.getBoundingClientRect().top < vh;
      cta.classList.toggle('show', past && !nearEnd);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Student login mock: animate steps when visible ---------- */
  var mock = document.getElementById('loginMock');
  if (mock && 'IntersectionObserver' in window) {
    var steps = mock.querySelectorAll('[data-step]'), bar = document.getElementById('lmProgress');
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      steps.forEach(function (s, i) {
        setTimeout(function () {
          if (i < 2) s.classList.add('done');
          else if (i === 2) s.classList.add('now');
        }, reduce ? 0 : 400 + i * 450);
      });
      setTimeout(function () { bar.style.width = '62%'; }, reduce ? 0 : 300);
    }, { threshold: .4 });
    io.observe(mock);
  }

  /* ---------- Batches: close a batch once it has started ---------- */
  var d = new Date();
  var todayISO = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  document.querySelectorAll('.batch[data-start]').forEach(function (b) {
    if (b.getAttribute('data-start') <= todayISO) {
      b.classList.add('closed');
      b.removeAttribute('href');
      b.querySelector('.batch-cta').textContent = 'Registration closed';
    }
  });
})();
