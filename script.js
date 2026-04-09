/* ═══════════════════════════════════════════════════
   ZHAOXING LI — Interactive Scripts
   Features:
   1. Neural-network particle canvas (hero bg, index only)
   2. Typing animation (hero subtitle, index only)
   3. Navbar: transparent → solid on scroll / always solid on inner pages
   4. Scroll reveal (IntersectionObserver)
   5. Publication filter tabs
   6. Hamburger menu
   7. Active nav link auto-detection
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. PARTICLE CANVAS — neural network style
     (only on pages that have #particle-canvas)
  ───────────────────────────────────────────── */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouse = { x: null, y: null };
    const N_PARTICLES  = 90;
    const MAX_DIST     = 140;
    const PARTICLE_COL = 'rgba(100, 255, 218,';
    const LINE_COL     = 'rgba(100, 255, 218,';

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.r  = Math.random() * 1.8 + 0.6;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_COL + '0.7)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < N_PARTICLES; i++) particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = LINE_COL + alpha + ')';
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          const dx   = particles[i].x - mouse.x;
          const dy   = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST * 1.5) {
            const alpha = (1 - dist / (MAX_DIST * 1.5)) * 0.55;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = LINE_COL + alpha + ')';
            ctx.lineWidth   = 1;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => { resize(); initParticles(); });
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    resize();
    initParticles();
    animateParticles();
  }


  /* ─────────────────────────────────────────────
     2. TYPING ANIMATION (index.html only)
  ───────────────────────────────────────────── */
  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const PHRASES = [
      'Research Fellow @ University of Southampton',
      'AI Safety & Multi-Agent Systems',
      'LLM Governance & Technical AI Risk',
      'Human-AI Interaction & Educational AI',
      '35 Publications · h-index 12',
    ];
    let phraseIdx = 0, charIdx = 0, deleting = false;
    const TYPE_SPEED   = 55;
    const DELETE_SPEED = 28;
    const PAUSE_END    = 2000;
    const PAUSE_START  = 400;

    function typeLoop() {
      const phrase = PHRASES[phraseIdx];
      if (!deleting) {
        typedEl.textContent = phrase.slice(0, ++charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          setTimeout(typeLoop, PAUSE_END);
          return;
        }
        setTimeout(typeLoop, TYPE_SPEED);
      } else {
        typedEl.textContent = phrase.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting  = false;
          phraseIdx = (phraseIdx + 1) % PHRASES.length;
          setTimeout(typeLoop, PAUSE_START);
          return;
        }
        setTimeout(typeLoop, DELETE_SPEED);
      }
    }
    typeLoop();
  }


  /* ─────────────────────────────────────────────
     3. NAVBAR SCROLL EFFECT
     Inner pages already have .scrolled class;
     index.html navbar transitions on scroll.
  ───────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('scrolled')) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────
     4. ACTIVE NAV LINK auto-detection
  ───────────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href !== '#' && !a.classList.contains('nav-cv')) {
      const linkPage = href.split('/').pop();
      if (linkPage === currentPage) {
        a.classList.add('active');
      }
    }
  });


  /* ─────────────────────────────────────────────
     5. SCROLL REVEAL
  ───────────────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


  /* ─────────────────────────────────────────────
     6. PUBLICATION FILTER
  ───────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.f-btn');
  const pubItems   = document.querySelectorAll('.pub-item');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.f;
        pubItems.forEach(item => {
          const type = item.dataset.type || '';
          const year = item.dataset.year || '';
          const tag  = item.dataset.tag  || '';

          const match =
            filter === 'all'        ? true :
            filter === 'journal'    ? type === 'journal'     :
            filter === 'conference' ? type === 'conference'  :
            filter === '2025'       ? year === '2025'        :
            filter === '2024'       ? year === '2024'        :
            filter === '2023'       ? year === '2023'        :
            filter === '2022'       ? year === '2022'        :
            filter === 'ai'         ? tag.includes('ai')     :
            filter === 'education'  ? tag.includes('education') :
            filter === 'hci'        ? tag.includes('hci')    : true;

          item.classList.toggle('hidden', !match);
        });
      });
    });
  }


  /* ─────────────────────────────────────────────
     7. HAMBURGER MENU
  ───────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }


  /* ─────────────────────────────────────────────
     8. SCHOLAR STATS — load from scholar_data.json
     Updates citation/h-index counters on any page
     that has #stat-citations, #stat-hindex, etc.
  ───────────────────────────────────────────── */
  const scholarStatEls = {
    citations: document.getElementById('stat-citations'),
    hindex:    document.getElementById('stat-hindex'),
    papers:    document.getElementById('stat-papers'),
    i10index:  document.getElementById('stat-i10index'),
  };

  if (Object.values(scholarStatEls).some(Boolean)) {
    fetch('scholar_data.json?v=' + Date.now())
      .then(r => r.json())
      .then(data => {
        const s = data.stats || {};
        if (scholarStatEls.citations && s.citations != null) {
          scholarStatEls.citations.textContent = s.citations > 0 ? s.citations + '+' : s.citations;
        }
        if (scholarStatEls.hindex && s.h_index != null) {
          scholarStatEls.hindex.textContent = s.h_index;
        }
        if (scholarStatEls.papers) {
          // Prefer explicit paper_count stat (= total including unlisted ones)
          const count = s.paper_count || (data.publications && data.publications.length) || 0;
          if (count > 0) scholarStatEls.papers.textContent = count;
        }
        if (scholarStatEls.i10index && s.i10_index != null) {
          scholarStatEls.i10index.textContent = s.i10_index;
        }
      })
      .catch(() => { /* Keep static fallback values */ });
  }


  /* ─────────────────────────────────────────────
     9. NEXT-PAGE NAVIGATION
     Shows a bar at the bottom; over-scroll or
     click navigates to the next page in sequence.
  ───────────────────────────────────────────── */
  const PAGE_ORDER = [
    'index.html', 'about.html', 'research.html',
    'publications.html', 'projects.html', 'experience.html', 'contact.html'
  ];
  const PAGE_NAMES = {
    'index.html':       'Home',
    'about.html':       'About',
    'research.html':    'Research',
    'publications.html':'Publications',
    'projects.html':    'Projects',
    'experience.html':  'Experience',
    'contact.html':     'Contact',
  };

  const curPage  = window.location.pathname.split('/').pop() || 'index.html';
  const curIdx   = PAGE_ORDER.indexOf(curPage);
  const nextPage = (curIdx >= 0 && curIdx < PAGE_ORDER.length - 1)
                 ? PAGE_ORDER[curIdx + 1] : null;

  if (nextPage) {
    const bar = document.createElement('div');
    bar.id = 'next-page-bar';
    bar.innerHTML =
      `<span class="npb-label">Next —</span>` +
      `<span class="npb-name">${PAGE_NAMES[nextPage]}</span>` +
      `<span class="npb-arrow">→</span>` +
      `<span class="npb-progress"></span>`;
    document.body.appendChild(bar);

    let atBottom    = false;
    let navTimer    = null;
    let overScrolls = 0;

    function goNext() {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { window.location.href = nextPage; }, 300);
    }

    function startCountdown() {
      if (navTimer) return;
      bar.classList.add('counting');
      navTimer = setTimeout(goNext, 900);
    }

    function cancelCountdown() {
      if (navTimer) { clearTimeout(navTimer); navTimer = null; }
      bar.classList.remove('counting');
    }

    function isAtBottom() {
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 6;
    }

    window.addEventListener('scroll', () => {
      if (isAtBottom()) {
        if (!atBottom) { atBottom = true; bar.classList.add('visible'); }
      } else {
        if (atBottom) {
          atBottom = false;
          bar.classList.remove('visible');
          cancelCountdown();
          overScrolls = 0;
        }
      }
    }, { passive: true });

    window.addEventListener('wheel', (e) => {
      if (atBottom && e.deltaY > 0) {
        overScrolls++;
        if (overScrolls >= 2) startCountdown();
      } else {
        overScrolls = 0;
      }
    }, { passive: true });

    bar.addEventListener('click', goNext);
    bar.addEventListener('mouseenter', () => { if (atBottom) startCountdown(); });
    bar.addEventListener('mouseleave', cancelCountdown);
  }

})();
