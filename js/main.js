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

/* ══════════════════════════════════════════════════════
   HERO CENTER — Live Campaign Intelligence Network
══════════════════════════════════════════════════════ */
(function initNetwork() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  const CHANNELS = [
    { label: 'Instagram', color: '#e1306c', glow: 'rgba(225,48,108,0.5)' },
    { label: 'Facebook',  color: '#1877F2', glow: 'rgba(24,119,242,0.5)' },
    { label: 'Google',    color: '#4285F4', glow: 'rgba(66,133,244,0.5)' },
    { label: 'YouTube',   color: '#FF0000', glow: 'rgba(255,0,0,0.5)'    },
    { label: 'SEO',       color: '#0A66FF', glow: 'rgba(10,102,255,0.5)' },
    { label: 'Ads',       color: '#FBBC04', glow: 'rgba(251,188,4,0.5)'  },
  ];

  const hub = { x: 0.5, y: 0.5, r: 18, pulse: 0 };
  const nodes = CHANNELS.map((ch, i) => {
    const angle = (i / CHANNELS.length) * Math.PI * 2 - Math.PI / 2;
    const dist = 0.28 + (i % 2 === 0 ? 0 : 0.06);
    return {
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist * 0.72,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      r: 9 + (i % 3) * 2,
      pulse: i * 1.05,
      ...ch
    };
  });

  const particles = Array.from({length: 35}, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004,
    r: Math.random() * 1.4 + 0.4, a: Math.random() * 0.35 + 0.08,
    color: CHANNELS[Math.floor(Math.random() * CHANNELS.length)].color
  }));

  const signals = nodes.map((n, i) => ({
    nodeIdx: i, progress: i / nodes.length,
    speed: 0.005 + Math.random() * 0.004, color: n.color, size: 3 + (i % 3)
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const hx = hub.x * W, hy = hub.y * H;

    /* BG glow */
    const bg = ctx.createRadialGradient(hx, hy, 0, hx, hy, W * 0.5);
    bg.addColorStop(0, 'rgba(10,102,255,0.07)'); bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    /* Edges hub→node */
    nodes.forEach(n => {
      const nx = n.x*W, ny = n.y*H;
      const g = ctx.createLinearGradient(hx, hy, nx, ny);
      g.addColorStop(0, 'rgba(10,102,255,0.45)');
      g.addColorStop(1, n.glow.replace('0.5','0.25'));
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(nx, ny);
      ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke();
    });

    /* Cross edges */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = (a.x-b.x)*W, dy = (a.y-b.y)*H, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 150) {
          ctx.beginPath(); ctx.moveTo(a.x*W, a.y*H); ctx.lineTo(b.x*W, b.y*H);
          ctx.strokeStyle = `rgba(58,160,255,${0.07*(1-d/150)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }

    /* Signal packets */
    signals.forEach(sig => {
      sig.progress += sig.speed; if (sig.progress > 1) sig.progress = 0;
      const n = nodes[sig.nodeIdx];
      const px = hx + (n.x*W - hx) * sig.progress;
      const py = hy + (n.y*H - hy) * sig.progress;
      const grd = ctx.createRadialGradient(px, py, 0, px, py, sig.size*3);
      grd.addColorStop(0, sig.color); grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(px, py, sig.size*3, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, sig.size, 0, Math.PI*2); ctx.fillStyle = sig.color; ctx.fill();
    });

    /* Satellite nodes */
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0.12 || n.x > 0.88) n.vx *= -1;
      if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
      n.pulse += 0.04;
      const nx = n.x*W, ny = n.y*H, pr = n.r + Math.sin(n.pulse) * 2.5;
      const grd = ctx.createRadialGradient(nx, ny, pr*0.5, nx, ny, pr*3.5);
      grd.addColorStop(0, n.glow); grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(nx, ny, pr*3.5, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(nx, ny, pr, 0, Math.PI*2); ctx.fillStyle = n.color; ctx.fill();
      ctx.beginPath(); ctx.arc(nx, ny, pr*0.35, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
      ctx.font = `600 ${Math.round(pr*0.85)}px Inter,sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.textAlign = 'center';
      ctx.fillText(n.label, nx, ny + pr + 13);
    });

    /* Hub */
    hub.pulse += 0.025;
    const hp = 18 + Math.sin(hub.pulse) * 2.5;
    [1,2,3].forEach(ring => {
      ctx.beginPath(); ctx.arc(hx, hy, hp + ring*13 + Math.sin(hub.pulse - ring*0.5)*3, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(10,102,255,${0.22 - ring*0.06})`; ctx.lineWidth = 1; ctx.stroke();
    });
    const hgrd = ctx.createRadialGradient(hx, hy, 0, hx, hy, hp*2.5);
    hgrd.addColorStop(0, 'rgba(10,102,255,0.55)'); hgrd.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(hx, hy, hp*2.5, 0, Math.PI*2); ctx.fillStyle = hgrd; ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, hp, 0, Math.PI*2); ctx.fillStyle = '#0A66FF'; ctx.fill();
    ctx.font = `800 ${Math.round(hp*0.72)}px Syne,sans-serif`;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('VR', hx, hy + hp*0.28);

    /* Particles */
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── Hero floating icons parallax + 3D mouse tilt ── */
const heroOrbit = document.querySelector('.hero-icons-orbit');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
  if (!heroOrbit) return;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  mouseX = (e.clientX - cx) / cx;
  mouseY = (e.clientY - cy) / cy;
  heroOrbit.style.transform = `perspective(800px) rotateY(${mouseX * 12}deg) rotateX(${-mouseY * 8}deg) translate(${mouseX * 20}px, ${mouseY * 14}px)`;
});

/* ── Hero scroll parallax with depth ── */
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroContent) {
    heroContent.style.transform = `translateY(${y * 0.12}px)`;
    heroContent.style.opacity = Math.max(0, 1 - y / 600);
  }
  if (heroOrbit) {
    heroOrbit.style.transform = `perspective(800px) rotateY(${mouseX * 12}deg) rotateX(${-mouseY * 8}deg) translateY(${y * 0.07}px) scale(${Math.max(0.85, 1 - y / 2000)})`;
  }
}, { passive: true });

/* ── Icon staggered 3D entrance on load ── */
window.addEventListener('load', () => {
  document.querySelectorAll('.hicon').forEach((icon, i) => {
    setTimeout(() => icon.classList.add('icon-visible'), 400 + i * 150);
  });
});

/* ── Section 3D scroll entrance ── */
const s3dObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('s3d-visible'); s3dObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.section-3d').forEach(s => s3dObs.observe(s));

/* ── Scroll-driven section micro-tilt ── */
function updateSectionTilt() {
  const vh = window.innerHeight;
  document.querySelectorAll('.section-3d.s3d-visible').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
    const tiltX = Math.max(-3, Math.min(3, progress * 4));
    sec.style.transform = `perspective(1200px) rotateX(${tiltX}deg)`;
  });
}
window.addEventListener('scroll', updateSectionTilt, { passive: true });

/* ── Case card 3D tilt ── */
document.querySelectorAll('.case-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(16px) translateY(-6px)`;
    card.style.transition = 'transform 0.08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = ''; card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
  });
});

/* ── Insight card 3D tilt ── */
document.querySelectorAll('.insight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(12px) translateY(-6px)`;
    card.style.transition = 'transform 0.08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = ''; card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
  });
});

/* ── About card mouse parallax ── */
const aboutCard = document.querySelector('.about-card');
if (aboutCard) {
  aboutCard.addEventListener('mousemove', e => {
    const r = aboutCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    aboutCard.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 12}deg) translateZ(20px)`;
    aboutCard.style.transition = 'transform 0.1s ease';
    aboutCard.style.animation = 'none';
  });
  aboutCard.addEventListener('mouseleave', () => {
    aboutCard.style.transform = '';
    aboutCard.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
    setTimeout(() => { aboutCard.style.animation = ''; }, 800);
  });
}



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

/* ── Contact form — FormSubmit.co handles email delivery ── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    const name = (form.name && form.name.value.trim()) || '';
    const email = (form.email && form.email.value.trim()) || '';
    if (!name || !email) { e.preventDefault(); return; }
    const btn = document.getElementById('submitBtn');
    const txt = document.getElementById('submitText');
    if (btn && txt) { btn.disabled = true; txt.textContent = 'Sending...'; }
  });
}
