'use strict';

/* ══════════════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════════════ */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = -200, my = -200, fx = -200, fy = -200;
let cursorVisible = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  if (!cursorVisible) {
    cursorVisible = true;
    cursor.classList.add('active');
    follower.classList.add('active');
  }
});

(function animCursor() {
  fx += (mx - fx) * 0.1; fy += (my - fy) * 0.1;
  follower.style.left = fx + 'px'; follower.style.top = fy + 'px';
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a, button, .svc-card, .case-card, .why-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '14px'; cursor.style.height = '14px';
    cursor.style.background = 'rgba(245,197,24,0.5)';
    follower.style.width = '56px'; follower.style.height = '56px';
    follower.style.borderColor = 'rgba(245,197,24,1)';
    follower.style.background = 'rgba(245,197,24,0.06)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px'; cursor.style.height = '8px';
    cursor.style.background = '#f5c518';
    follower.style.width = '36px'; follower.style.height = '36px';
    follower.style.borderColor = 'rgba(245,197,24,0.5)';
    follower.style.background = 'transparent';
  });
});

/* ══════════════════════════════════════════════════════
   WEBGL AURORA HERO BACKGROUND
══════════════════════════════════════════════════════ */
const canvas = document.getElementById('heroCanvas');
const gl = canvas ? (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) : null;

if (gl) {
  const vsSource = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;
  const fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_mouse;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v=0.0, a=0.5;
      for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=0.5; }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 m  = u_mouse / u_res;
      float t = u_time * 0.15;

      vec2 q = vec2(fbm(uv + t*0.4), fbm(uv + vec2(1.7,9.2)));
      vec2 r = vec2(fbm(uv + 2.0*q + vec2(1.7,9.2) + t*0.3),
                    fbm(uv + 2.0*q + vec2(8.3,2.8) + t*0.25));
      float f = fbm(uv + 2.8*r);

      float md = length(uv - m);
      f += 0.1 * exp(-md * 3.5);

      /* Gold/amber color palette */
      vec3 col = mix(vec3(0.02,0.01,0.0), vec3(0.12,0.08,0.0), clamp(f*f*4.0,0.0,1.0));
      col = mix(col, vec3(0.28,0.18,0.0),  clamp(f*f*f*8.0,0.0,1.0));
      col = mix(col, vec3(0.55,0.38,0.02),  clamp(pow(f,4.0)*16.0,0.0,1.0));

      float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.4);
      col *= vig;

      gl_FragColor = vec4(col * 0.9, 1.0);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let glW = 0, glH = 0, glMX = 0, glMY = 0;
  function resizeGL() {
    glW = canvas.width  = canvas.offsetWidth;
    glH = canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, glW, glH);
  }
  resizeGL();
  window.addEventListener('resize', resizeGL);
  document.addEventListener('mousemove', e => { glMX = e.clientX; glMY = glH - e.clientY; });

  function renderGL(t) {
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uRes, glW, glH);
    gl.uniform2f(uMouse, glMX, glMY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(renderGL);
  }
  requestAnimationFrame(renderGL);
}

/* ══════════════════════════════════════════════════════
   3D NETWORK SPHERE — Canvas 2D (no external deps)
   Renders a glowing node network sphere on the right
══════════════════════════════════════════════════════ */
(function initSphere() {
  const sc = document.getElementById('sphereCanvas');
  if (!sc) return;
  const ctx = sc.getContext('2d');
  let W, H, mouseX = 0, mouseY = 0;
  let rotX = 0, rotY = 0, targetRotX = 0, targetRotY = 0;

  function resize() {
    const wrap = sc.parentElement;
    W = sc.width  = wrap.offsetWidth;
    H = sc.height = wrap.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* Generate sphere nodes */
  const NODE_COUNT = 120;
  const RADIUS = 0.38; /* fraction of min(W,H) */
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    nodes.push({
      ox: Math.sin(phi) * Math.cos(theta),
      oy: Math.sin(phi) * Math.sin(theta),
      oz: Math.cos(phi),
      pulse: Math.random() * Math.PI * 2,
      size: Math.random() * 1.5 + 0.8
    });
  }

  /* Precompute edges (connect nearby nodes) */
  const edges = [];
  const EDGE_DIST = 0.55;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].ox - nodes[j].ox;
      const dy = nodes[i].oy - nodes[j].oy;
      const dz = nodes[i].oz - nodes[j].oz;
      if (Math.sqrt(dx*dx + dy*dy + dz*dz) < EDGE_DIST) {
        edges.push([i, j]);
      }
    }
  }

  function rotatePoint(x, y, z, rx, ry) {
    /* Rotate around Y */
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    /* Rotate around X */
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
  }

  let t = 0;
  function draw() {
    t += 0.005;
    ctx.clearRect(0, 0, W, H);

    /* Smooth rotation toward mouse */
    targetRotY = mouseX * 0.4 + t * 0.3;
    targetRotX = mouseY * 0.25;
    rotX += (targetRotX - rotX) * 0.04;
    rotY += (targetRotY - rotY) * 0.04;

    const R = Math.min(W, H) * RADIUS;
    const cx = W * 0.5, cy = H * 0.5;

    /* Project all nodes */
    const projected = nodes.map((n, idx) => {
      const p = rotatePoint(n.ox, n.oy, n.oz, rotX, rotY);
      const scale = 1 + p.z * 0.3;
      const px = cx + p.x * R * scale;
      const py = cy + p.y * R * scale;
      const alpha = (p.z + 1) * 0.5;
      const pulse = 0.7 + 0.3 * Math.sin(t * 2 + n.pulse);
      return { px, py, z: p.z, alpha, pulse, size: n.size };
    });

    /* Draw edges */
    edges.forEach(([i, j]) => {
      const a = projected[i], b = projected[j];
      const avgAlpha = (a.alpha + b.alpha) * 0.5;
      if (avgAlpha < 0.15) return;
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
      grad.addColorStop(0, `rgba(245,197,24,${avgAlpha * 0.25})`);
      grad.addColorStop(0.5, `rgba(255,224,102,${avgAlpha * 0.35})`);
      grad.addColorStop(1, `rgba(245,197,24,${avgAlpha * 0.25})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });

    /* Draw nodes */
    projected.forEach(p => {
      if (p.alpha < 0.1) return;
      const r = p.size * p.pulse * (0.8 + p.z * 0.4);
      /* Glow */
      const grd = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 4);
      grd.addColorStop(0, `rgba(245,197,24,${p.alpha * 0.5})`);
      grd.addColorStop(1, 'rgba(245,197,24,0)');
      ctx.beginPath();
      ctx.arc(p.px, p.py, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      /* Core dot */
      ctx.beginPath();
      ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.z > 0 ? '255,232,122' : '245,197,24'},${p.alpha * 0.9})`;
      ctx.fill();
    });

    /* Outer glow ring */
    const ringGrd = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.15);
    ringGrd.addColorStop(0, 'rgba(245,197,24,0)');
    ringGrd.addColorStop(0.5, `rgba(245,197,24,${0.06 + 0.02 * Math.sin(t)})`);
    ringGrd.addColorStop(1, 'rgba(245,197,24,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrd;
    ctx.lineWidth = R * 0.3;
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════════
   HERO PARALLAX
══════════════════════════════════════════════════════ */
const heroInner = document.querySelector('.hero-inner');
const hero3d    = document.querySelector('.hero-3d-wrap');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroInner) heroInner.style.transform = `translateY(${y * 0.18}px)`;
  if (hero3d)    hero3d.style.transform    = `translateY(calc(-50% + ${y * 0.1}px))`;
}, { passive: true });

/* ══════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActive();
}, { passive: true });

function updateActive() {
  const sections = document.querySelectorAll('section[id]');
  const y = window.scrollY + 120;
  sections.forEach(s => {
    const link = document.querySelector(`.nav-link[href="#${s.id}"]`);
    if (link) link.classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  });
}

/* ══════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ══════════════════════════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' }); }
  });
});

/* ══════════════════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════════════════ */
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.dataset.dir) {
    if      (el.closest('.about-visual'))  el.dataset.dir = 'left';
    else if (el.closest('.about-text'))    el.dataset.dir = 'right';
    else if (el.closest('.contact-left'))  el.dataset.dir = 'left';
    else if (el.closest('.contact-right')) el.dataset.dir = 'right';
    else el.dataset.dir = 'up';
  }
});

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0) * 90;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ══════════════════════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════════════════════ */
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animCount(entry.target); counterObs.unobserve(entry.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-n').forEach(c => counterObs.observe(c));

function animCount(el) {
  const target = +el.dataset.target, dur = 2200, start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(easeOutExpo(t) * target);
    if (t < 1) requestAnimationFrame(frame); else el.textContent = target;
  }
  requestAnimationFrame(frame);
}

/* ══════════════════════════════════════════════════════
   3D TILT — service, case, why cards
══════════════════════════════════════════════════════ */
function addTilt(selector, intensity) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x*intensity}deg) rotateX(${-y*intensity}deg) translateY(-6px) scale(1.01)`;
      card.style.transition = 'transform 0.08s ease';
      const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    });
  });
}
addTilt('.svc-card', 7);
addTilt('.case-card', 5);
addTilt('.why-card', 6);

/* ══════════════════════════════════════════════════════
   PROCESS — highlight active step
══════════════════════════════════════════════════════ */
const processObs = new IntersectionObserver(entries => {
  entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
}, { threshold: 0.55 });
document.querySelectorAll('.process-item').forEach(el => processObs.observe(el));

/* ══════════════════════════════════════════════════════
   CONTACT FORM — mailto
══════════════════════════════════════════════════════ */
const OWNER_EMAIL = 'nallamillivamsireddy2001@gmail.com';
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"] span');
    const orig = btn.textContent;

    const name     = form.name.value.trim();
    const email    = form.email.value.trim();
    const business = form.business.value.trim();
    const service  = form.service.value;
    const message  = form.message.value.trim();

    const subject = encodeURIComponent(
      `Strategy Call Request — ${name}${business ? ' (' + business + ')' : ''}`
    );
    const body = encodeURIComponent(
      `New Strategy Call Request from VReach Website\n\n` +
      `Name:     ${name}\n` +
      `Email:    ${email}\n` +
      `Business: ${business || '—'}\n` +
      `Service:  ${service || '—'}\n\n` +
      `Message:\n${message || '—'}`
    );

    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;

    btn.textContent = 'Opening mail app...';
    setTimeout(() => {
      btn.textContent = '✓ Request sent!';
      form.reset();
      setTimeout(() => { btn.textContent = orig; }, 4000);
    }, 1500);
  });
}
