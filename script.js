/* ═══════════════════════════════════════════════════════════
   STARK DEV INTERACTIVE ENGINE — script.js
═══════════════════════════════════════════════════════════ */

'use strict';

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
    }, speed || 40);
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

function addIntroLog(text) {
  const log = document.getElementById('jlog');
  if (!log) return;
  const div = document.createElement('div');
  div.className = 'jlog-item';
  div.textContent = '▶ ' + text;
  log.appendChild(div);
  if (log.children.length > 3) log.children[0].remove();
}

/* --- CINEMATIC RADAR --- */
const BLIPS = [[0.7, 0.30], [2.1, 0.58], [3.8, 0.72], [4.6, 0.42]];
let radarAngle = 0, radarRAF;

function initRadar() {
  const cv  = document.getElementById('jradar');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, CX = W / 2, CY = W / 2, R = CX * 0.85;

  function draw() {
    ctx.clearRect(0, 0, W, W);
    [R, R * 0.6, R * 0.35].forEach(r => {
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,255,.15)'; ctx.lineWidth = .6; ctx.stroke();
    });
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(radarAngle);
    const g = ctx.createLinearGradient(0, 0, R, 0);
    g.addColorStop(0, 'rgba(0,212,255,0)'); g.addColorStop(1, 'rgba(0,212,255,.2)');
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -Math.PI / 4, 0); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    radarAngle += 0.02;
    radarRAF = requestAnimationFrame(draw);
  }
  draw();
}

/* --- INTRO FLOW --- */
async function runJarvisIntro() {
  initRadar();
  const clockEl = document.getElementById('jclock');
  const tick = () => { if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); };
  tick(); setInterval(tick, 1000);

  await sleep(300);
  const titleEl  = document.getElementById('jtitle');
  const statusEl = document.getElementById('jstatus');

  await typeText(titleEl, 'STARK DEV', 90);
  await growBar(30, 500);
  addIntroLog('AVENGERS PROTOCOL CODEBASE DETECTED');

  await typeText(statusEl, 'DECIHERING NODE ARRAYS...', 30);
  await growBar(65, 600);
  addIntroLog('DASHBOARD MODULE MOUNTED');

  await typeText(statusEl, 'ALL OPERATIONAL CHANNELS OK.', 30);
  await growBar(100, 300);
  addIntroLog('WELCOME BACK, OPERATOR');

  await sleep(600);
  cancelAnimationFrame(radarRAF);
  skipIntro();
}

function skipIntro() {
  cancelAnimationFrame(radarRAF);
  const overlay  = document.getElementById('jintro');
  const mainSite = document.getElementById('main-site');
  if (overlay) overlay.classList.add('fade-out');
  if (mainSite) {
    mainSite.classList.add('visible');
    initMainSite();
  }
  setTimeout(() => { if (overlay) overlay.remove(); }, 1100);
}

/* --- DYNAMIC CONSOLE STREAM LOGGER --- */
function appendTerminalRow(text, isHighlight = false) {
  const consoleBody = document.getElementById('matrix-console');
  if (!consoleBody) return;
  
  const row = document.createElement('div');
  row.className = `term-row ${isHighlight ? 'text-highlight' : ''}`;
  row.textContent = `> ${text}`;
  
  consoleBody.appendChild(row);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

/* --- SIMULATE THE MULTI-AGENT ROLL CALL SEQUENCER --- */
async function triggerProtocolAssemble(e) {
  if (e) e.preventDefault();
  
  const bannerText = document.getElementById('protocol-status-text');
  const indicator = document.querySelector('.status-indicator-node');
  const nodes = document.querySelectorAll('.agent-node');
  
  if (indicator) indicator.classList.add('active');
  if (bannerText) bannerText.textContent = "ACTIVATING AVENGERS PROTOCOL // INITIALIZING ROLL CALL";
  
  // Clean up any old active instances safely
  nodes.forEach(n => n.classList.remove('activated'));
  
  // Sequence each node precisely one after another like the video reel
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const agentName = node.getAttribute('data-agent');
    const logMessage = node.getAttribute('data-log');
    
    node.classList.add('activated');
    if (bannerText) bannerText.textContent = `ORCHESTRATING PROTOCOLS // AGENT [${agentName}] ONLINE`;
    appendTerminalRow(logMessage, true);
    
    await sleep(700); // Visual step hold
  }
  
  if (bannerText) bannerText.textContent = "AVENGERS PROTOCOL ASSEMBLED // ALL CLUSTER NODES AT FULL CAPACITY";
  appendTerminalRow("Operational Assembly Complete. System running optimal.", false);
}

/* --- BACKGROUND GRAPH CHANNELS --- */
function initParticles() {
  const cv = document.getElementById('ptx');
  if (!cv) return;
  const section = document.getElementById('home');
  const ctx = cv.getContext('2d');

  const resize = () => { cv.width = section.offsetWidth; cv.height = section.offsetHeight; };
  resize(); window.addEventListener('resize', resize);

  const dots = Array.from({ length: 45 }, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.2 + 0.4
  }));

  function frame() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > cv.width) d.vx *= -1;
      if (d.y < 0 || d.y > cv.height) d.vy *= -1;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,.3)'; ctx.fill();
    });

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.1 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* --- INTERACTIVE CORE INITIALIZER --- */
const TYPED_STRINGS = ['Full-Stack Architect', 'Mobile Security Engine Designer', 'Cybersecurity Specialist', 'STARK Protocol Builder'];
let tIdx = 0, tCharIdx = 0, tDeleting = false;

function heroTyping() {
  const el = document.getElementById('typed');
  if (!el) return;
  const current = TYPED_STRINGS[tIdx];

  if (!tDeleting) {
    el.textContent = current.substring(0, tCharIdx + 1); tCharIdx++;
    if (tCharIdx === current.length) { tDeleting = true; setTimeout(heroTyping, 1500); return; }
  } else {
    el.textContent = current.substring(0, tCharIdx - 1); tCharIdx--;
    if (tCharIdx === 0) { tDeleting = false; tIdx = (tIdx + 1) % TYPED_STRINGS.length; setTimeout(heroTyping, 300); return; }
  }
  setTimeout(heroTyping, tDeleting ? 30 : 60);
}

function animateCounters() {
  document.querySelectorAll('.hnum').forEach(el => {
    const target = parseInt(el.dataset.to, 10);
    let current = 0; const step = Math.ceil(target / 20);
    const iv = setInterval(() => {
      current = Math.min(current + step, target); el.textContent = current;
      if (current >= target) clearInterval(iv);
    }, 50);
  });
}

function initScrollReveal() {
  let countersDone = false;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (!countersDone && entry.target.closest('#home')) { countersDone = true; animateCounters(); }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -6;
      const ry = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 6;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 30);
    const max = document.body.scrollHeight - window.innerHeight;
    const bar = document.getElementById('sprogress');
    if (bar) bar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });
}

function initCursor() {
  const ring = document.getElementById('cursor'), dot = document.getElementById('cursor-dot');
  if (!ring || !dot) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  const lag = () => { rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(lag); };
  lag();
}

function toggleNav() {
  document.getElementById('navlinks')?.classList.toggle('open');
  document.getElementById('ham')?.classList.toggle('open');
}

function initMainSite() {
  initParticles(); initScrollReveal(); initNavbar(); initTilt(); initCursor(); heroTyping();
  document.querySelectorAll('#home .reveal').forEach(el => el.classList.add('visible'));
  
  // Directly bind click interactions onto tactical layout cards to allow manual roll calls
  document.querySelectorAll('.agent-node').forEach(node => {
    node.addEventListener('click', () => {
      node.classList.toggle('activated');
      const name = node.getAttribute('data-agent');
      const msg = node.getAttribute('data-log');
      if (node.classList.contains('activated')) {
        appendTerminalRow(`Manual override: Connection established to [${name}].`, true);
        appendTerminalRow(msg, false);
      } else {
        appendTerminalRow(`Connection closed with [${name}]. Node entering sleep mode.`, false);
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', runJarvisIntro);
