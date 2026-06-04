/* ═══════════════════════════════════════════════════════════
   STARK DEV INTERACTIVE ENGINE — script.js
   Mark VIII: Live Rain, AudioContext Storms, Mobile Voice Patch
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

/* --- AUDIO CONTEXT SYNTHESIZER (NATIVE THUNDER) --- */
let audioCtx;
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Ensure AudioEngine wakes up on the very first screen interaction
document.body.addEventListener('click', initAudio, { once: true });
document.body.addEventListener('touchstart', initAudio, { once: true });

function synthesizeThunder() {
  if (!audioCtx) return;
  // Generate 3.5 seconds of static white noise
  const bufferSize = audioCtx.sampleRate * 3.5; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  // Exponential low-pass filter to muffle the noise into deep thunder rumbles
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(250, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 3);
  
  // Gain envelope: instant boom, then fade out
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.1); 
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 3.4); 
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  noise.start();
}

function flashLightning() {
  const flash = document.getElementById('lightning-flash');
  if(!flash) return;
  
  // Double blinding flash effect
  flash.style.opacity = '0.7';
  setTimeout(() => flash.style.opacity = '0', 60);
  setTimeout(() => {
    flash.style.opacity = '0.4';
    setTimeout(() => flash.style.opacity = '0', 50);
  }, 180);
  
  // Thunder rolls exactly after the light hits
  setTimeout(synthesizeThunder, 300);
}

// 30 Second Storm Loop Schedule
setInterval(flashLightning, 30000);


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
    
    // Diagnostic logging for Android Chrome errors
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
    initAudio(); // Force audio engine wake up on mobile tap
    try {
      if (isListening) {
        recognition.stop();
        appendTerminalRow("Aural receptors manually deactivated.", false);
      } else {
        synth.cancel(); 
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

/* --- BACKGROUND GRAPH (LIVE RAIN MATRIX) --- */
function initParticles() {
  const cv = document.getElementById('ptx'); if (!cv) return;
  const section = document.getElementById('home'); const ctx = cv.getContext('2d');

  const resize = () => { cv.width = section.offsetWidth; cv.height = section.offsetHeight; };
  resize(); window.addEventListener('resize', resize);

  // Generates physical rain droplets falling fast at a slight trajectory
  const drops = Array.from({ length: 150 }, () => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    length: Math.random() * 20 + 10,
    speed: Math.random() * 8 + 6
  }));

  function frame() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    
    drops.forEach(d => {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.length * 0.15, d.y + d.length); 
      
      d.x -= d.speed * 0.15;
      d.y += d.speed;
      
      // Reset drop to the top
      if (d.y > cv.height) {
        d.y = -d.length;
        d.x = Math.random() * cv.width;
      }
    });
    
    ctx.stroke();
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
      initAudio(); // Ensure sound engine fires
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

