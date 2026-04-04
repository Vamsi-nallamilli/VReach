'use strict';

/* Scroll progress */
const prog = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  prog.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
}, { passive: true });

/* Cursor */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = -200, my = -200, rx = -200, ry = -200, curOn = false;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  if (!curOn) { curOn = true; cur.classList.add('on'); ring.classList.add('on'); }
});
(function animRing() {
  rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,.svc-row,.case,.icon3d').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.style.width = '12px'; cur.style.height = '12px';
    ring.style.width = '52px'; ring.style.height = '52px';
    ring.style.borderColor = 'rgba(10,102,255,.9)';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.width = '7px'; cur.style.height = '7px';
    ring.style.width = '32px'; ring.style.height = '32px';
    ring.style.borderColor = 'rgba(10,102,255,.45)';
  });
});

/* WebGL hero background */
(function() {
  const c = document.getElementById('heroBg');
  if (!c) return;
  const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
  if (!gl) return;
  const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const fs = `precision mediump float;
    uniform float t;uniform vec2 res;uniform vec2 mouse;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/res,m=mouse/res;float tt=t*.12;
      vec2 q=vec2(fbm(uv+tt*.4),fbm(uv+vec2(1.7,9.2)));
      vec2 r=vec2(fbm(uv+2.*q+vec2(1.7,9.2)+tt*.3),fbm(uv+2.*q+vec2(8.3,2.8)+tt*.25));
      float f=fbm(uv+2.8*r)+.08*exp(-length(uv-m)*4.);
      vec3 col=mix(vec3(.03,.06,.18),vec3(.04,.12,.35),clamp(f*f*4.,0.,1.));
      col=mix(col,vec3(.06,.25,.65),clamp(f*f*f*8.,0.,1.));
      col=mix(col,vec3(.15,.5,.95),clamp(pow(f,4.)*16.,0.,1.));
      col*=1.-smoothstep(.4,1.2,length(uv-.5)*1.4);
      gl_FragColor=vec4(col*.9,1.);
    }`;
  function mk(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fs));
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
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; gl.viewport(0,0,W,H); }
  resize(); window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { gx = e.clientX; gy = H - e.clientY; });
  function render(t) { gl.uniform1f(uT, t*.001); gl.uniform2f(uR, W, H); gl.uniform2f(uM, gx, gy); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); requestAnimationFrame(render); }
  requestAnimationFrame(render);
})();

/* Particle canvas for dark sections */
function initParticles(id) {
  const c = document.getElementById(id);
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H;
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  const pts = Array.from({length: 60}, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()-.5)*.0003, vy: (Math.random()-.5)*.0003,
    r: Math.random()*1.2+.4, a: Math.random()*.35+.08
  }));
  (function loop() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0) p.x=1; if (p.x>1) p.x=0;
      if (p.y<0) p.y=1; if (p.y>1) p.y=0;
      ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(58,160,255,${p.a})`; ctx.fill();
    });
    for (let i=0; i<pts.length; i++) for (let j=i+1; j<pts.length; j++) {
      const dx=(pts[i].x-pts[j].x)*W, dy=(pts[i].y-pts[j].y)*H, d=Math.sqrt(dx*dx+dy*dy);
      if (d<100) { ctx.beginPath(); ctx.moveTo(pts[i].x*W,pts[i].y*H); ctx.lineTo(pts[j].x*W,pts[j].y*H); ctx.strokeStyle=`rgba(58,160,255,${.1*(1-d/100)})`; ctx.lineWidth=.5; ctx.stroke(); }
    }
    requestAnimationFrame(loop);
  })();
}
initParticles('resultsBg');
initParticles('contactBg');

/* Hero right — mouse parallax */
const heroRight = document.getElementById('heroRight');
const heroLeft = document.querySelector('.hero-left');
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5);
  mouseY = (e.clientY / window.innerHeight - 0.5);
  if (heroRight) heroRight.style.transform = `perspective(1000px) rotateY(${mouseX * 8}deg) rotateX(${-mouseY * 5}deg)`;
});
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroLeft) { heroLeft.style.transform = `translateY(${y * 0.1}px)`; heroLeft.style.opacity = Math.max(0, 1 - y / 700); }
  if (heroRight) heroRight.style.transform = `perspective(1000px) rotateY(${mouseX * 8}deg) rotateX(${-mouseY * 5}deg) translateY(${y * 0.06}px)`;
}, { passive: true });

/* Nav */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  const y = window.scrollY + 120;
  document.querySelectorAll('section[id]').forEach(s => {
    const link = document.querySelector(`.nl[href="#${s.id}"]`);
    if (link) link.classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  });
}, { passive: true });

/* Mobile menu */
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

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' }); }
  });
});

/* Reveal on scroll */
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.dataset.dir) {
    if (el.closest('.about-card') || el.closest('.about-grid > :first-child')) el.dataset.dir = 'left';
    else if (el.closest('.about-text') || el.closest('.about-grid > :last-child')) el.dataset.dir = 'right';
    else if (el.closest('.contact-left')) el.dataset.dir = 'left';
    else if (el.closest('.contact-right')) el.dataset.dir = 'right';
    else if (el.closest('.wwd-grid > :first-child')) el.dataset.dir = 'left';
    else if (el.closest('.wwd-grid > :last-child')) el.dataset.dir = 'right';
    else el.dataset.dir = 'up';
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

/* Counters */
function easeOut(t) { return 1 - Math.pow(2, -10 * t); }
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animCount(e.target); cntObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.sn').forEach(el => cntObs.observe(el));
function animCount(el) {
  const target = +el.dataset.target, dur = 2000, start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(easeOut(t) * target);
    if (t < 1) requestAnimationFrame(frame); else el.textContent = target;
  }
  requestAnimationFrame(frame);
}

/* Process steps */
const procObs = new IntersectionObserver(entries => {
  entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
}, { threshold: 0.55 });
document.querySelectorAll('.proc-step').forEach(el => procObs.observe(el));

/* Card 3D tilt */
document.querySelectorAll('.case,.about-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x*12}deg) rotateX(${-y*9}deg) translateZ(12px) translateY(-6px)`;
    card.style.transition = 'transform 0.08s ease';
    card.style.animation = 'none';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
    setTimeout(() => { card.style.animation = ''; }, 700);
  });
});

/* Form */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', () => {
    const btn = document.getElementById('submitBtn');
    const txt = document.getElementById('submitText');
    if (btn && txt) { btn.disabled = true; txt.textContent = 'Sending...'; }
  });
}
