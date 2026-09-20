/* =============================================
   CODEBUZZ.AI — script.js
   Navbar · Mobile menu · FAQ · Scroll reveal
   Counters · Form · Smooth scroll · Year
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ===== NAVBAR SCROLL EFFECT ===== */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  /* ===== HAMBURGER / MOBILE MENU ===== */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on any mobile link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });


  /* ===== SMOOTH SCROLL (offset for fixed navbar) ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id     = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ===== SCROLL REVEAL (IntersectionObserver) ===== */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


  /* ===== ANIMATED COUNTERS ===== */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = parseInt(el.getAttribute('data-to'), 10);
      const duration = 1800;
      const fps      = 60;
      const steps    = Math.round((duration / 1000) * fps);
      let   current  = 0;
      let   frame    = 0;

      const tick = () => {
        frame++;
        // ease-out: progress accelerates then decelerates
        const progress = 1 - Math.pow(1 - frame / steps, 3);
        current = Math.round(target * progress);
        el.textContent = current;
        if (frame < steps) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));


  /* ===== FAQ ACCORDION ===== */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('active');

      // Close all open items
      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        openItem.classList.remove('active');
        openItem.querySelector('.faq-a').classList.remove('open');
      });

      // Open the clicked one (if it was closed)
      if (!isOpen) {
        item.classList.add('active');
        answer.classList.add('open');
      }
    });
  });


  /* ===== ACTIVE NAV LINK (highlight on scroll) ===== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--brand)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObs.observe(s));


  /* ===== CONTACT FORM (client-side) ===== */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate required fields
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const empty = !field.value.trim();
        field.classList.toggle('form-error', empty);
        if (empty) valid = false;
      });
      if (!valid) return;

      // Loading state
      const originalText   = submitBtn.textContent;
      submitBtn.textContent = 'Sending\u2026';
      submitBtn.disabled    = true;

      /*
       * ── HOW TO CONNECT A REAL FORM BACKEND ──────────────────────────────
       *
       * Option A — Formspree (free tier, no server needed):
       *   1. Sign up at https://formspree.io and create a form.
       *   2. Replace the fetch URL below with your Formspree endpoint, e.g.:
       *      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
       *        method: 'POST',
       *        headers: { 'Content-Type': 'application/json' },
       *        body: JSON.stringify(Object.fromEntries(new FormData(form)))
       *      });
       *   3. Remove the setTimeout simulation below.
       *
       * Option B — EmailJS (send directly from the browser):
       *   1. Sign up at https://www.emailjs.com
       *   2. Follow their JS SDK setup and call emailjs.sendForm(...)
       *
       * Option C — mailto fallback (no backend at all):
       *   window.location.href = 'mailto:info@codebuzz.ai?subject=Project Enquiry';
       * ────────────────────────────────────────────────────────────────────
       */

      // Simulate submission (replace with real fetch above for production)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Success state
      form.reset();
      submitBtn.style.display = 'none';
      successMsg.classList.add('show');

      // Reset after 8 seconds
      setTimeout(() => {
        successMsg.classList.remove('show');
        submitBtn.style.display = '';
        submitBtn.textContent   = originalText;
        submitBtn.disabled      = false;
      }, 8000);
    });

    // Clear error highlight on input
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('form-error'));
    });
  }

  /* ===== RE-LOAD IFRAME (for better performance) ===== */
  const iframe = document.querySelector('.contact-form-wrap iframe');
  const originalSrc = iframe.src;
  let formSubmitted = false;

  // Listen for iframe load events
  iframe.addEventListener('load', () => {
    if (formSubmitted) {
      // Form was submitted, reset back
      setTimeout(() => {
        iframe.src = originalSrc;
        formSubmitted = false;
      }, 1000);
    } else {
      // First load, mark as ready
      formSubmitted = true;
    }
  });

  /* ===== CURRENT YEAR IN FOOTER ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
