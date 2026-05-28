/* ═══════════════════════════════════════════════════════════
   STARK DEV — script.js
   All animations, Jarvis intro, particles, interactions
═══════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════
   UTILITY
══════════════════════════════════════════ */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function typeText(el, text, speed) {
  return new Promise(res => {
    el.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'jcursor-blink';
    cursor.textContent = '|';
    el.appendChild(cursor);
    const iv = setInterval(() => {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      if (i >= text.length) { clearInterval(iv); cursor.remove(); res(); }
    }, speed || 52);
  });
}

let _pct = 0;
function growBar(target, ms) {
  return new Promise(res => {
    const start = _pct, t0 = Date.now();
    const fill = document.getElementById('jpfill');
    const pctEl = document.getElementById('jpct');
    const tick = () => {
      const t = Math.min((Date.now() - t0) / ms, 1);
      _pct = start + (target - start) * t;
      if (fill) fill.style.width = _pct.toFixed(1) + '%';
      if (pctEl) pctEl.textContent = Math.round(_pct) + '%';
      if (t < 1) requestAnimationFrame(tick); else res();
    };
    tick();
  });
}

function addLog(text) {
  const log = document.getElementById('jlog');
  if (!log) return;
  const div = document.createElement('div');
  div.className = 'jlog-item';
  div.textContent = '▶ ' + text;
  log.appendChild(div);
  if (log.children.length > 3) log.children[0].remove();
}

/* ══════════════════════════════════════════
   JARVIS RADAR CANVAS
══════════════════════════════════════════ */
const BLIPS = [[0.7, 0.30], [2.1, 0.58], [3.8, 0.72], [4.6, 0.42], [1.4, 0.65]];
let radarAngle = 0, radarRAF;

function initRadar() {
  const cv  = document.getElementById('jradar');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, CX = W / 2, CY = W / 2, R = CX * 0.88;

  function draw() {
    ctx.clearRect(0, 0, W, W);

    /* Concentric rings */
    [R, R * 0.66, R * 0.40].forEach(r => {
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,255,.18)';
      ctx.lineWidth = .7;
      ctx.stroke();
    });

    /* Crosshairs */
    ctx.beginPath();
    ctx.moveTo(CX - R, CY); ctx.lineTo(CX + R, CY);
    ctx.moveTo(CX, CY - R); ctx.lineTo(CX, CY + R);
    ctx.strokeStyle = 'rgba(0,212,255,.12)';
    ctx.lineWidth = .6;
    ctx.stroke();

    /* Sweep sector */
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(radarAngle);
    const g = ctx.createLinearGradient(0, 0, R, 0);
    g.addColorStop(0, 'rgba(0,212,255,0)');
    g.addColorStop(1, 'rgba(0,212,255,.22)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, -Math.PI / 3.2, 0);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();

    /* Leading edge */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R, 0);
    ctx.strokeStyle = 'rgba(0,212,255,.9)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    /* Blips */
    BLIPS.forEach(([a, rf]) => {
      const diff = ((a - radarAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const fade = diff < 0.1 ? 1 : Math.max(0, 1 - diff / (Math.PI * 2) * 4.5);
      if (!fade) return;
      const bx = CX + Math.cos(a) * R * rf;
      const by = CY + Math.sin(a) * R * rf;
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${fade})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${fade * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    radarAngle += 0.022;
    radarRAF = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════
   JARVIS INTRO SEQUENCE (Upgraded)
══════════════════════════════════════════ */
async function runJarvisIntro() {
  // Check if the user has already seen the intro this session
  if (sessionStorage.getItem('jarvisBooted') === 'true') {
    skipIntro(true); // pass true for instant skip
    return;
  }

  initRadar();

  const clockEl = document.getElementById('jclock');
  const tick = () => { if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); };
  tick();
  const clockIv = setInterval(tick, 1000);

  await sleep(400);

  const titleEl  = document.getElementById('jtitle');
  const statusEl = document.getElementById('jstatus');

  await typeText(titleEl, 'STARK DEV', 110);
  await growBar(20, 600);
  addLog('CORE SYSTEMS BOOTED');

  await typeText(statusEl, 'LOADING SUBSYSTEMS...', 45);
  await growBar(45, 900);
  addLog('SUBSYSTEMS ONLINE');

  await typeText(statusEl, 'AUTHENTICATING USER...', 45);
  await growBar(68, 700);
  addLog('USER: JACK — AUTHORIZED');

  await typeText(statusEl, 'CALIBRATING INTERFACE...', 45);
  await growBar(88, 700);
  addLog('UI RENDER ENGINE READY');

  await typeText(statusEl, 'ALL SYSTEMS NOMINAL.', 45);
  await growBar(100, 400);
  addLog('WELCOME, JACK');

  await sleep(1000);

  clearInterval(clockIv);
  cancelAnimationFrame(radarRAF);
  
  // Mark as booted for this session
  sessionStorage.setItem('jarvisBooted', 'true');
  skipIntro(false);
}

function skipIntro(instant = false) {
  cancelAnimationFrame(radarRAF);
  const overlay  = document.getElementById('jintro');
  const mainSite = document.getElementById('main-site');
  
  // Mark session storage so manual skips also prevent reload
  sessionStorage.setItem('jarvisBooted', 'true');
  
  if (overlay) {
    if (instant) {
      overlay.style.display = 'none';
    } else {
      overlay.classList.add('fade-out');
      setTimeout(() => { overlay.remove(); }, 1500);
    }
  }
  
  if (mainSite) {
    mainSite.classList.add('visible');
    initMainSite();
  }
}


/* ══════════════════════════════════════════
   PARTICLES CANVAS (Hero background)
══════════════════════════════════════════ */
function initParticles() {
  const cv = document.getElementById('ptx');
  if (!cv) return;
  const section = document.getElementById('home');
  const ctx = cv.getContext('2d');

  const resize = () => {
    cv.width  = section.offsetWidth;
    cv.height = section.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 35 : 65;

  const dots = Array.from({ length: COUNT }, () => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5
  }));

  const LINK = isMobile ? 100 : 140;

  function frame() {
    ctx.clearRect(0, 0, cv.width, cv.height);

    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > cv.width)  d.vx *= -1;
      if (d.y < 0 || d.y > cv.height) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,.5)';
      ctx.fill();
    });

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / LINK)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ══════════════════════════════════════════
   HERO TYPING EFFECT
══════════════════════════════════════════ */
const TYPED_STRINGS = [
  'Web Developer',
  'Android Developer',
  'UI/UX Designer',
  'Problem Solver',
  'STARK DEV Builder'
];

let tIdx = 0, tCharIdx = 0, tDeleting = false;

function heroTyping() {
  const el = document.getElementById('typed');
  if (!el) return;
  const current = TYPED_STRINGS[tIdx];

  if (!tDeleting) {
    el.textContent = current.substring(0, tCharIdx + 1);
    tCharIdx++;
    if (tCharIdx === current.length) {
      tDeleting = true;
      setTimeout(heroTyping, 1800);
      return;
    }
  } else {
    el.textContent = current.substring(0, tCharIdx - 1);
    tCharIdx--;
    if (tCharIdx === 0) {
      tDeleting = false;
      tIdx = (tIdx + 1) % TYPED_STRINGS.length;
      setTimeout(heroTyping, 400);
      return;
    }
  }
  setTimeout(heroTyping, tDeleting ? 40 : 80);
}

/* ══════════════════════════════════════════
   STAT COUNTER ANIMATION
══════════════════════════════════════════ */
function animateCounters() {
  document.querySelectorAll('.hnum').forEach(el => {
    const target = parseInt(el.dataset.to, 10);
    let current = 0;
    const step = Math.ceil(target / 25);
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(iv);
    }, 60);
  });
}

/* ══════════════════════════════════════════
   SKILL RING ANIMATION
══════════════════════════════════════════ */
function animateSkillRings() {
  const CIRC = 2 * Math.PI * 34; // r=34 → ≈213.6
  document.querySelectorAll('.sk-fill').forEach(circle => {
    const pct = parseInt(circle.dataset.p, 10) / 100;
    circle.style.strokeDashoffset = CIRC * (1 - pct);
  });
}

/* ══════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
══════════════════════════════════════════ */
let countersDone = false, skillsDone = false;

function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');

      /* Trigger counters when hero-stats enters view */
      if (!countersDone && entry.target.closest('#home')) {
        countersDone = true;
        animateCounters();
      }

      /* Trigger skill rings when skills section enters */
      if (!skillsDone && entry.target.closest('#skills')) {
        skillsDone = true;
        setTimeout(animateSkillRings, 300);
      }

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════
   CARD TILT EFFECT
══════════════════════════════════════════ */
function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return; /* skip on touch */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const rx = ((e.clientY - cy) / (r.height / 2)) * -8;
      const ry = ((e.clientX - cx) / (r.width  / 2)) *  8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('sprogress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════
   NAVBAR SCROLL + ACTIVE LINK
══════════════════════════════════════════ */
function initNavbar() {
  const nav    = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nlink');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    /* Sticky style */
    nav && nav.classList.toggle('scrolled', window.scrollY > 40);

    /* Active link */
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}

/* ══════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════ */
function initCursor() {
  const ring = document.getElementById('cursor');
  const dot  = document.getElementById('cursor-dot');
  if (!ring || !dot) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  /* Smooth lag for outer ring */
  const lag = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lag);
  };
  lag();

  /* Scale up on hoverable elements */
  document.querySelectorAll('a, button, .proj-card, .about-card, .skill-card, .cc').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'rgba(0,212,255,.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--cyan)';
    });
  });
}

/* ══════════════════════════════════════════
   NAV TOGGLE (mobile)
══════════════════════════════════════════ */
function toggleNav() {
  const nl  = document.getElementById('navlinks');
  const ham = document.getElementById('ham');
  if (nl)  nl.classList.toggle('open');
  if (ham) ham.classList.toggle('open');
}

/* Close nav on link click */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nlink').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navlinks')?.classList.remove('open');
      document.getElementById('ham')?.classList.remove('open');
    });
  });
});

/* ══════════════════════════════════════════
   MAIN SITE INIT (called after intro)
══════════════════════════════════════════ */
function initMainSite() {
  initParticles();
  initScrollReveal();
  initScrollProgress();
  initNavbar();
  initTilt();
  initCursor();
  heroTyping();

  /* Immediately reveal elements in view (hero) */
  document.querySelectorAll('#home .reveal').forEach(el => {
    el.classList.add('visible');
  });
  /* Trigger hero counters */
  if (!countersDone) { countersDone = true; animateCounters(); }
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', runJarvisIntro);
