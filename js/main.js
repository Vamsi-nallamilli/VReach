'use strict';

/* ── Scroll Progress ── */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  progressBar.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
}, { passive: true });

/* ── Custom Cursor ── */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = -200, my = -200, rx = -200, ry = -200;
let cursorOn = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  if (!cursorOn) { cursorOn = true; cur.classList.add('on'); ring.classList.add('on'); }
});
(function animRing() {
  rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a, button, .svc-row, .case-card, .insight-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.style.width = '12px'; cur.style.height = '12px'; cur.style.background = 'rgba(10,102,255,.5)';
    ring.style.width = '52px'; ring.style.height = '52px'; ring.style.borderColor = 'rgba(10,102,255,.9)';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.width = '7px'; cur.style.height = '7px'; cur.style.background = '#0A66FF';
    ring.style.width = '32px'; ring.style.height = '32px'; ring.style.borderColor = 'rgba(10,102,255,.45)';
  });
});

/* ── WebGL Hero Background ── */
(function initHeroGL() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`;
  const fs = `
    precision mediump float;
    uniform float t; uniform vec2 res; uniform vec2 mouse;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/res;
      vec2 m=mouse/res;
      float tt=t*.12;
      vec2 q=vec2(fbm(uv+tt*.4),fbm(uv+vec2(1.7,9.2)));
      vec2 r=vec2(fbm(uv+2.*q+vec2(1.7,9.2)+tt*.3),fbm(uv+2.*q+vec2(8.3,2.8)+tt*.25));
      float f=fbm(uv+2.8*r);
      f+=.08*exp(-length(uv-m)*4.);
      /* White/blue palette */
      vec3 col=mix(vec3(.03,.06,.18),vec3(.04,.12,.35),clamp(f*f*4.,0.,1.));
      col=mix(col,vec3(.06,.25,.65),clamp(f*f*f*8.,0.,1.));
      col=mix(col,vec3(.15,.5,.95),clamp(pow(f,4.)*16.,0.,1.));
      float vig=1.-smoothstep(.4,1.2,length(uv-.5)*1.4);
      col*=vig;
      gl_FragColor=vec4(col*.9,1.);
    }
  `;
  function mkShader(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const uT = gl.getUniformLocation(prog, 't');
  const uR = gl.getUniformLocation(prog, 'res');
  const uM = gl.getUniformLocation(prog, 'mouse');
  let W = 0, H = 0, gx = 0, gy = 0;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; gl.viewport(0,0,W,H); }
  resize(); window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { gx = e.clientX; gy = H - e.clientY; });
  function render(t) { gl.uniform1f(uT, t*.001); gl.uniform2f(uR, W, H); gl.uniform2f(uM, gx, gy); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); requestAnimationFrame(render); }
  requestAnimationFrame(render);
})();

/* ── Particle canvas for Results + Contact sections ── */
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 80; i++) pts.push({ x: Math.random(), y: Math.random(), vx: (Math.random()-.5)*.0003, vy: (Math.random()-.5)*.0003, r: Math.random()*1.2+.4, a: Math.random()*.4+.1 });
  (function loop() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(58,160,255,${p.a})`; ctx.fill();
    });
    /* Draw connecting lines */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const dx = (pts[i].x - pts[j].x)*W, dy = (pts[i].y - pts[j].y)*H;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(pts[i].x*W, pts[i].y*H); ctx.lineTo(pts[j].x*W, pts[j].y*H);
          ctx.strokeStyle = `rgba(58,160,255,${.12*(1-d/120)})`; ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  })();
}
initParticles('resultsCanvas');
initParticles('contactCanvas');

/* ── Hero floating icons parallax ── */
const heroOrbit = document.querySelector('.hero-icons-orbit');
document.addEventListener('mousemove', e => {
  if (!heroOrbit) return;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
  heroOrbit.style.transform = `translate(${dx * 18}px, ${dy * 12}px)`;
});

/* ── Hero scroll parallax ── */
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroContent) heroContent.style.transform = `translateY(${y * 0.12}px)`;
  if (heroOrbit) heroOrbit.style.transform = `translateY(${y * 0.06}px)`;
}, { passive: true });

/* ── Navbar ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  updateActive();
}, { passive: true });
function updateActive() {
  const y = window.scrollY + 120;
  document.querySelectorAll('section[id]').forEach(s => {
    const link = document.querySelector(`.nl[href="#${s.id}"]`);
    if (link) link.classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  });
}

/* ── Mobile menu ── */
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('.nl').forEach(l => l.addEventListener('click', () => {
  navLinks.classList.remove('open'); burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
}));

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' }); }
  });
});

/* ── Reveal on scroll ── */
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.dataset.dir) {
    if      (el.closest('.about-visual'))  el.dataset.dir = 'left';
    else if (el.closest('.about-text'))    el.dataset.dir = 'right';
    else if (el.closest('.contact-left'))  el.dataset.dir = 'left';
    else if (el.closest('.contact-right')) el.dataset.dir = 'right';
    else if (el.closest('.wwd-left'))      el.dataset.dir = 'left';
    else if (el.closest('.wwd-right'))     el.dataset.dir = 'right';
  }
});
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), parseInt(e.target.dataset.delay || 0) * 90);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── Animated counters ── */
function easeOut(t) { return 1 - Math.pow(2, -10 * t); }
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animCount(e.target); cntObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-n').forEach(el => cntObs.observe(el));
function animCount(el) {
  const target = +el.dataset.target, dur = 2000, start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(easeOut(t) * target);
    if (t < 1) requestAnimationFrame(frame); else el.textContent = target;
  }
  requestAnimationFrame(frame);
}

/* ── Process step highlight ── */
const procObs = new IntersectionObserver(entries => {
  entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
}, { threshold: 0.55 });
document.querySelectorAll('.process-step').forEach(el => procObs.observe(el));

/* ── Service row tilt ── */
document.querySelectorAll('.svc-row').forEach(row => {
  row.addEventListener('mousemove', e => {
    const rect = row.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    row.style.transform = `perspective(800px) rotateY(${x*3}deg) rotateX(${-y*2}deg)`;
    row.style.transition = 'transform 0.08s ease';
  });
  row.addEventListener('mouseleave', () => {
    row.style.transform = ''; row.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
  });
});

/* ── Case card tilt ── */
document.querySelectorAll('.case-card, .insight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x*5}deg) rotateX(${-y*4}deg) translateY(-6px)`;
    card.style.transition = 'transform 0.08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = ''; card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
  });
});

/* ── Contact form ── */
const OWNER = 'nallamillivamsireddy2001@gmail.com';
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span:first-child') || form.querySelector('button[type="submit"]');
    const name = form.name.value.trim(), email = form.email.value.trim();
    const business = form.business.value.trim(), service = form.service.value, message = form.message.value.trim();
    const subject = encodeURIComponent(`Free Digital Audit — ${name}${business ? ' (' + business + ')' : ''}`);
    const body = encodeURIComponent(`Free Digital Audit Request\n\nName: ${name}\nEmail: ${email}\nBusiness: ${business||'—'}\nService: ${service||'—'}\n\nMessage:\n${message||'—'}`);
    window.location.href = `mailto:${OWNER}?subject=${subject}&body=${body}`;
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Opening mail app...</span>';
    setTimeout(() => {
      submitBtn.innerHTML = '<span>✓ Request sent!</span>';
      form.reset();
      setTimeout(() => { submitBtn.innerHTML = origText; }, 4000);
    }, 1500);
  });
}
