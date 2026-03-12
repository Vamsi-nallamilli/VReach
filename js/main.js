'use strict';

/* ══════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════════════ */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR — magnetic + trail
══════════════════════════════════════════════════════ */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
const trail    = document.getElementById('cursorTrail');
let mx = -200, my = -200, fx = -200, fy = -200, tx = -200, ty = -200;
let cursorVisible = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  if (!cursorVisible) {
    cursorVisible = true;
    cursor.classList.add('active');
    follower.classList.add('active');
    trail.classList.add('active');
  }
});

(function animCursor() {
  fx += (mx - fx) * 0.1;  fy += (my - fy) * 0.1;
  tx += (fx - tx) * 0.06; ty += (fy - ty) * 0.06;
  follower.style.left = fx + 'px'; follower.style.top = fy + 'px';
  trail.style.left    = tx + 'px'; trail.style.top    = ty + 'px';
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a, button, .svc-card, .port-card, .blog-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '14px'; cursor.style.height = '14px';
    cursor.style.background = 'rgba(33,150,243,0.5)';
    follower.style.width = '56px'; follower.style.height = '56px';
    follower.style.borderColor = 'rgba(33,150,243,1)';
    follower.style.background = 'rgba(33,150,243,0.06)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px'; cursor.style.height = '8px';
    cursor.style.background = '#2196F3';
    follower.style.width = '36px'; follower.style.height = '36px';
    follower.style.borderColor = 'rgba(33,150,243,0.6)';
    follower.style.background = 'transparent';
  });
});

/* ══════════════════════════════════════════════════════
   WEBGL AURORA HERO BACKGROUND
══════════════════════════════════════════════════════ */
const canvas = document.getElementById('heroCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

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
      float t = u_time * 0.18;

      vec2 q = vec2(fbm(uv + t*0.4), fbm(uv + vec2(1.7,9.2)));
      vec2 r = vec2(fbm(uv + 2.0*q + vec2(1.7,9.2) + t*0.3),
                    fbm(uv + 2.0*q + vec2(8.3,2.8) + t*0.25));
      float f = fbm(uv + 2.8*r);

      /* mouse influence */
      float md = length(uv - m);
      f += 0.12 * exp(-md * 3.0);

      vec3 col = mix(vec3(0.01,0.01,0.06), vec3(0.04,0.12,0.35), clamp(f*f*4.0,0.0,1.0));
      col = mix(col, vec3(0.05,0.22,0.6),  clamp(f*f*f*8.0,0.0,1.0));
      col = mix(col, vec3(0.13,0.47,0.95), clamp(pow(f,4.0)*16.0,0.0,1.0));

      /* subtle vignette */
      float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.4);
      col *= vig;

      gl_FragColor = vec4(col * 0.85, 1.0);
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

} else {
  /* Fallback: canvas 2D particles if WebGL unavailable */
  const ctx2 = canvas.getContext('2d');
  let W2, H2, pts = [];
  function resize2() { W2 = canvas.width = canvas.offsetWidth; H2 = canvas.height = canvas.offsetHeight; }
  resize2(); window.addEventListener('resize', resize2);
  for (let i = 0; i < 120; i++) pts.push({ x: Math.random()*W2, y: Math.random()*H2, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, r:Math.random()*1.5+.3, a:Math.random()*.5+.1, c:Math.random()>.5?'#2196F3':'#fff' });
  (function loop2() {
    ctx2.clearRect(0,0,W2,H2);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W2||p.y<0||p.y>H2){p.x=Math.random()*W2;p.y=Math.random()*H2;}
      ctx2.beginPath(); ctx2.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx2.fillStyle=p.c; ctx2.globalAlpha=p.a; ctx2.fill();
    });
    ctx2.globalAlpha=1; requestAnimationFrame(loop2);
  })();
}

/* ══════════════════════════════════════════════════════
   HERO PARALLAX + SCROLL-BASED TRANSFORMS
══════════════════════════════════════════════════════ */
const heroInner = document.querySelector('.hero-inner');
const heroBg    = document.querySelector('.hero-logo-bg');
const heroOrbs  = document.querySelector('.hero-orbs');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroInner) heroInner.style.transform = `translateY(${y * 0.2}px)`;
  if (heroBg)    heroBg.style.transform    = `translateY(calc(-50% + ${y * 0.3}px))`;
  if (heroOrbs)  heroOrbs.style.transform  = `translateY(${y * 0.12}px)`;
}, { passive: true });

/* ══════════════════════════════════════════════════════
   SPLIT TEXT — char-by-char animation on hero headline
══════════════════════════════════════════════════════ */
document.querySelectorAll('.split-text').forEach(el => {
  const text = el.textContent;
  el.textContent = '';
  text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.animationDelay = (0.3 + i * 0.04) + 's';
    el.appendChild(span);
  });
});

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
   REVEAL ON SCROLL — directional stagger
══════════════════════════════════════════════════════ */
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.dataset.dir) {
    if      (el.closest('.ps-left'))       el.dataset.dir = 'left';
    else if (el.closest('.ps-right'))      el.dataset.dir = 'right';
    else if (el.closest('.about-visual'))  el.dataset.dir = 'left';
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
   COUNTER ANIMATION — easeOutExpo
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
   3D TILT — cards with spotlight glow
══════════════════════════════════════════════════════ */
function addTilt(selector, intensity) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x*intensity}deg) rotateX(${-y*intensity}deg) translateY(-8px) scale(1.02)`;
      card.style.transition = 'transform 0.08s ease';
      /* spotlight for svc-cards */
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
addTilt('.svc-card', 8);
addTilt('.port-card', 5);
addTilt('.blog-card', 5);

/* ══════════════════════════════════════════════════════
   PROCESS — highlight active step on scroll
══════════════════════════════════════════════════════ */
const processObs = new IntersectionObserver(entries => {
  entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
}, { threshold: 0.55 });
document.querySelectorAll('.process-item').forEach(el => processObs.observe(el));

/* ══════════════════════════════════════════════════════
   SCROLL-BASED SECTION TINT (subtle bg shift)
══════════════════════════════════════════════════════ */
const sections = document.querySelectorAll('section');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('section-active');
    else e.target.classList.remove('section-active');
  });
}, { threshold: 0.3 });
sections.forEach(s => sectionObs.observe(s));

/* ══════════════════════════════════════════════════════
   MARQUEE — pause on hover (handled in CSS)
   PS LIST — stagger on reveal
══════════════════════════════════════════════════════ */
const psObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('li').forEach((li, i) => {
        li.style.transitionDelay = (i * 0.08) + 's';
        li.style.opacity = '1';
        li.style.transform = 'translateX(0)';
      });
      psObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.ps-list').forEach(list => {
  list.querySelectorAll('li').forEach(li => {
    li.style.opacity = '0';
    li.style.transform = 'translateX(-20px)';
    li.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  psObs.observe(list);
});

/* ══════════════════════════════════════════════════════
   CONTACT FORM — mailto to Vamsi
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
      `Free Audit Request — ${name}${business ? ' (' + business + ')' : ''}`
    );
    const body = encodeURIComponent(
      `New Free Audit Request from VReach Website\n\n` +
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
