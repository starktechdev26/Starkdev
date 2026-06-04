/* ═══════════════════════════════════════════════════════════
   STARK DEV INTERACTIVE ENGINE — script.js
   Mark VII: Voice Recognition Diagnostic & Mobile Patch
═══════════════════════════════════════════════════════════ */

'use strict';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* --- SPLASH CURSOR EFFECT --- */
document.addEventListener('click', (e) => {
  const splash = document.createElement('div');
  splash.className = 'cursor-splash';
  splash.style.left = e.clientX + 'px';
  splash.style.top = e.clientY + 'px';
  document.body.appendChild(splash);
  setTimeout(() => splash.remove(), 600); 
});

/* --- VOICE SYNTHESIS (SPEAKING) --- */
const synth = window.speechSynthesis;
let aiVoice = null;

function loadVoices() {
  const voices = synth.getVoices();
  if (voices.length === 0) return;
  aiVoice = voices.find(v => v.name.includes('UK English Male') || v.name.includes('Great Britain'))
         || voices.find(v => v.lang === 'en-GB')
         || voices.find(v => v.lang.startsWith('en'))
         || voices[0];
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

function speakVoice(text) {
  if (!synth) return;
  synth.cancel(); // Force stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  if (aiVoice) utterance.voice = aiVoice;
  utterance.pitch = 0.8; 
  utterance.rate = 1.05; 
  synth.speak(utterance);
}

/* --- VOICE RECOGNITION (LISTENING - UPGRADED FOR MOBILE) --- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

function initVoiceCommand() {
  const micBtn = document.getElementById('mic-btn');
  const micIcon = document.querySelector('#mic-btn i');
  
  if (!SpeechRecognition) {
    micBtn.style.display = 'none'; 
    appendTerminalRow("SYSTEM ALERT: Voice recognition not supported in this browser.", false);
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false; 
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micIcon.className = 'fas fa-microphone';
    appendTerminalRow("Aural receptors active. Listening for command...", true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    appendTerminalRow(`Voice Input: "${transcript}"`, false);
    processVoiceCommand(transcript);
  };

  recognition.onerror = (e) => {
    isListening = false;
    micBtn.classList.remove('listening');
    micIcon.className = 'fas fa-microphone-slash';
    
    // Detailed diagnostic logging for the Matrix Terminal
    if (e.error === 'not-allowed') {
      appendTerminalRow("MIC ERROR: Permission Denied. Check Chrome Site Settings.", false);
      speakVoice("Microphone access is currently blocked by your device settings.");
    } else if (e.error === 'no-speech') {
      appendTerminalRow("MIC ERROR: No speech detected. Channel closed.", false);
    } else if (e.error === 'network') {
      appendTerminalRow("MIC ERROR: Network routing failed.", false);
    } else {
      appendTerminalRow(`MIC ERROR: ${e.error}`, false);
    }
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    micIcon.className = 'fas fa-microphone-slash';
  };

  micBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try {
      if (isListening) {
        recognition.stop();
        appendTerminalRow("Aural receptors manually deactivated.", false);
      } else {
        synth.cancel(); // Stop AI voice so it doesn't listen to itself
        recognition.start();
      }
    } catch (err) {
      appendTerminalRow(`Mic Boot Error: ${err.message}`, false);
    }
  });
}

function processVoiceCommand(cmd) {
  if (cmd.includes('assemble') || cmd.includes('protocol')) {
    triggerProtocolAssemble();
  } else if (cmd.includes('steve') || cmd.includes('raksha') || cmd.includes('suraksha')) {
    document.querySelector('[data-agent="STEVE"]')?.click();
  } else if (cmd.includes('friday') || cmd.includes('master')) {
    document.querySelector('[data-agent="FRIDAY"]')?.click();
  } else if (cmd.includes('jarvis')) {
    document.querySelector('[data-agent="JARVIS"]')?.click();
  } else if (cmd.includes('hello') || cmd.includes('hi') || cmd.includes('jack')) {
    speakVoice("Hello Jack. All systems are currently awaiting your command.");
    appendTerminalRow("System greeting acknowledged.", true);
  } else if (cmd.includes('clear')) {
    document.getElementById('matrix-console').innerHTML = '';
    appendTerminalRow("Terminal memory cleared.", true);
  } else {
    speakVoice("Command not recognized in current matrix.");
    appendTerminalRow("Unknown voice command structure.", false);
  }
}

/* --- UTILITIES --- */
function typeText(el, text, speed) {
  return new Promise(res => {
    el.textContent = ''; let i = 0;
    const cursor = document.createElement('span'); cursor.className = 'jcursor-blink'; cursor.textContent = '|';
    el.appendChild(cursor);
    const iv = setInterval(() => { el.insertBefore(document.createTextNode(text[i]), cursor); i++;
      if (i >= text.length) { clearInterval(iv); cursor.remove(); res(); }
    }, speed || 40);
  });
}

let _pct = 0;
function growBar(target, ms) {
  return new Promise(res => {
    const start = _pct, t0 = Date.now();
    const fill = document.getElementById('jpfill'); const pctEl = document.getElementById('jpct');
    const tick = () => {
      const t = Math.min((Date.now() - t0) / ms, 1); _pct = start + (target - start) * t;
      if (fill) fill.style.width = _pct.toFixed(1) + '%'; if (pctEl) pctEl.textContent = Math.round(_pct) + '%';
      if (t < 1) requestAnimationFrame(tick); else res();
    }; tick();
  });
}

function addIntroLog(text) {
  const log = document.getElementById('jlog'); if (!log) return;
  const div = document.createElement('div'); div.className = 'jlog-item'; div.textContent = '▶ ' + text;
  log.appendChild(div); if (log.children.length > 3) log.children[0].remove();
}

/* --- CINEMATIC RADAR --- */
let radarAngle = 0, radarRAF;
function initRadar() {
  const cv  = document.getElementById('jradar'); if (!cv) return;
  const ctx = cv.getContext('2d'); const W = cv.width, CX = W / 2, CY = W / 2, R = CX - 2; 

  function draw() {
    ctx.clearRect(0, 0, W, W);
    [R, R * 0.6, R * 0.35].forEach(r => {
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,255,.12)'; ctx.lineWidth = .6; ctx.stroke();
    });
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(radarAngle);
    const g = ctx.createLinearGradient(0, 0, R, 0); g.addColorStop(0, 'rgba(0,212,255,0)'); g.addColorStop(1, 'rgba(0,212,255,.2)');
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -Math.PI / 4, 0); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    radarAngle += 0.02; radarRAF = requestAnimationFrame(draw);
  } draw();
}

/* --- INTRO FLOW --- */
async function runJarvisIntro() {
  initRadar();
  const clockEl = document.getElementById('jclock');
  const tick = () => { if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); }; tick(); setInterval(tick, 1000);

  await sleep(300);
  const titleEl = document.getElementById('jtitle'); const statusEl = document.getElementById('jstatus');

  await typeText(titleEl, 'STARK DEV', 90); await growBar(30, 500); addIntroLog('AVENGERS PROTOCOL CODEBASE DETECTED');
  await typeText(statusEl, 'DECIHERING NODE ARRAYS...', 30); await growBar(65, 600); addIntroLog('DASHBOARD MODULE MOUNTED');
  await typeText(statusEl, 'ALL OPERATIONAL CHANNELS OK.', 30); await growBar(100, 300); addIntroLog('WELCOME BACK, OPERATOR');

  await sleep(600); cancelAnimationFrame(radarRAF); skipIntro();
}

function skipIntro() {
  cancelAnimationFrame(radarRAF);
  const overlay  = document.getElementById('jintro'); const mainSite = document.getElementById('main-site');
  if (overlay) overlay.classList.add('fade-out');
  if (mainSite) { mainSite.classList.add('visible'); initMainSite(); }
  setTimeout(() => { if (overlay) overlay.remove(); }, 1100);
}

/* --- TERMINAL STREAM LOGGER --- */
function appendTerminalRow(text, isHighlight = false, linkUrl = null) {
  const consoleBody = document.getElementById('matrix-console'); if (!consoleBody) return;
  const row = document.createElement('div'); row.className = `term-row ${isHighlight ? 'text-highlight' : ''}`;
  
  if (linkUrl) {
    row.innerHTML = `> ${text} <a href="${linkUrl}" target="_blank" style="color:var(--cyan); font-weight:bold; margin-left:8px; text-decoration:underline; z-index: 10; position:relative;">[INITIATE PORTAL]</a>`;
  } else {
    row.textContent = `> ${text}`;
  }
  
  consoleBody.appendChild(row); consoleBody.scrollTop = consoleBody.scrollHeight;
}

/* --- MULTI-AGENT ROLL CALL --- */
async function triggerProtocolAssemble(e) {
  if (e) e.preventDefault();
  if (!aiVoice) loadVoices();
  
  const bannerText = document.getElementById('protocol-status-text');
  const indicator = document.querySelector('.status-indicator-node');
  const nodes = document.querySelectorAll('.agent-node');
  
  if (indicator) indicator.classList.add('active');
  if (bannerText) bannerText.textContent = "ACTIVATING AVENGERS PROTOCOL // INITIALIZING ROLL CALL";
  nodes.forEach(n => n.classList.remove('activated'));
  
  speakVoice("Avengers assemble. All agents reporting in.");
  await sleep(2500); 
  
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const agentName = node.getAttribute('data-agent');
    const logMessage = node.getAttribute('data-log');
    
    node.classList.add('activated');
    if (bannerText) bannerText.textContent = `ORCHESTRATING PROTOCOLS // AGENT [${agentName}] ONLINE`;
    
    appendTerminalRow(logMessage, true);
    speakVoice(logMessage);
    
    const voiceDelay = Math.max(1800, logMessage.length * 80);
    await sleep(voiceDelay); 
  }
  
  if (bannerText) bannerText.textContent = "AVENGERS PROTOCOL ASSEMBLED // ALL CLUSTER NODES AT FULL CAPACITY";
  const finalMessage = "Operational Assembly Complete. What are your orders, Jack?";
  appendTerminalRow(finalMessage, false); speakVoice(finalMessage);
}

/* --- BACKGROUND GRAPH (CURVED LOOPING) --- */
function initParticles() {
  const cv = document.getElementById('ptx'); if (!cv) return;
  const section = document.getElementById('home'); const ctx = cv.getContext('2d');

  const resize = () => { cv.width = section.offsetWidth; cv.height = section.offsetHeight; };
  resize(); window.addEventListener('resize', resize);

  const dots = Array.from({ length: 45 }, () => ({
    baseX: Math.random() * cv.width, baseY: Math.random() * cv.height,
    x: 0, y: 0,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    angle: Math.random() * Math.PI * 2, orbitSpeed: Math.random() * 0.02 + 0.01,
    orbitRadius: Math.random() * 40 + 10, r: Math.random() * 1.2 + 0.4
  }));

  function frame() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    dots.forEach(d => {
      d.baseX += d.vx; d.baseY += d.vy;
      if (d.baseX < 0 || d.baseX > cv.width) d.vx *= -1;
      if (d.baseY < 0 || d.baseY > cv.height) d.vy *= -1;
      
      d.angle += d.orbitSpeed;
      d.x = d.baseX + Math.sin(d.angle) * d.orbitRadius;
      d.y = d.baseY + Math.cos(d.angle) * d.orbitRadius;

      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,.4)'; ctx.fill();
    });

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 130) {
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / 130)})`; ctx.lineWidth = 0.5; ctx.stroke();
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
  const el = document.getElementById('typed'); if (!el) return;
  const current = TYPED_STRINGS[tIdx];

  if (!tDeleting) {
    el.textContent = current.substring(0, tCharIdx + 1); tCharIdx++;
    if (tCharIdx === current.length) { tDeleting = true; setTimeout(heroTyping, 1500); return; }
  } else {
    el.textContent = current.substring(0, tCharIdx - 1); tCharIdx--;
    if (tCharIdx === 0) { tDeleting = false; tIdx = (tIdx + 1) % TYPED_STRINGS.length; setTimeout(heroTyping, 300); return; }
  } setTimeout(heroTyping, tDeleting ? 30 : 60);
}

function animateCounters() {
  document.querySelectorAll('.hnum').forEach(el => {
    const target = parseInt(el.dataset.to, 10); let current = 0; const step = Math.ceil(target / 20);
    const iv = setInterval(() => { current = Math.min(current + step, target); el.textContent = current;
      if (current >= target) clearInterval(iv);
    }, 50);
  });
}

function initScrollReveal() {
  let countersDone = false;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return; entry.target.classList.add('visible');
      if (!countersDone && entry.target.closest('#home')) { countersDone = true; animateCounters(); }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 }); document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -6;
      const ry = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 6;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    }); card.addEventListener('mouseleave', () => card.style.transform = '');
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
  const ring = document.getElementById('cursor'), dot = document.getElementById('cursor-dot'); if (!ring || !dot) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  const lag = () => { rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(lag); }; lag();
}

function toggleNav() {
  document.getElementById('navlinks')?.classList.toggle('open');
  document.getElementById('ham')?.classList.toggle('open');
}

function initMainSite() {
  initParticles(); initScrollReveal(); initNavbar(); initTilt(); initCursor(); heroTyping(); initVoiceCommand();
  document.querySelectorAll('#home .reveal').forEach(el => el.classList.add('visible'));
  
  document.querySelectorAll('.agent-node').forEach(node => {
    node.addEventListener('click', () => {
      if (!aiVoice) loadVoices();
      node.classList.toggle('activated');
      const name = node.getAttribute('data-agent');
      const msg = node.getAttribute('data-log');
      const linkUrl = node.getAttribute('data-url');

      if (node.classList.contains('activated')) {
        appendTerminalRow(`Manual override: Connection established to [${name}].`, true);
        appendTerminalRow(msg, false, linkUrl);
        speakVoice(`Override accepted. ${msg}`);
      } else {
        const sleepMsg = `Connection closed with ${name}. Node entering sleep mode.`;
        appendTerminalRow(sleepMsg, false);
        speakVoice(sleepMsg);
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', runJarvisIntro);
