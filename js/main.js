'use strict';

/* ── Custom Cursor ── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = -100, my = -100, fx = -100, fy = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  cursor.classList.add('active');
  follower.classList.add('active');
});

(function animFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx + 'px';
  follower.style.top = fy + 'px';
  requestAnimationFrame(animFollower);
})();

document.querySelectorAll('a, button, .svc-card, .port-card, .blog-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    follower.style.width = '56px';
    follower.style.height = '56px';
    follower.style.borderColor = 'rgba(33,150,243,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    follower.style.width = '36px';
    follower.style.height = '36px';
    follower.style.borderColor = 'rgba(33,150,243,0.5)';
  });
});

/* ── Hero Canvas Particles ── */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}

resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.6 ? '#2196F3' : '#ffffff';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = '#2196F3';
        ctx.globalAlpha = (1 - dist / 100) * 0.08;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animCanvas() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  ctx.globalAlpha = 1;
  requestAnimationFrame(animCanvas);
}

animCanvas();

/* ── Navbar ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActive();
}, { passive: true });

/* ── Active Nav Link ── */
function updateActive() {
  const sections = document.querySelectorAll('section[id]');
  const y = window.scrollY + 120;
  sections.forEach(s => {
    const link = document.querySelector(`.nav-link[href="#${s.id}"]`);
    if (link) link.classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  });
}

/* ── Mobile Menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

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

/* ── Smooth Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

/* ── Reveal on Scroll ── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObs.observe(el));

/* ── Counter Animation ── */
const counters = document.querySelectorAll('.stat-n');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animCount(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObs.observe(c));

function animCount(el) {
  const target = +el.dataset.target;
  const dur = 2200;
  const step = target / (dur / 16);
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.floor(cur);
    if (cur >= target) clearInterval(t);
  }, 16);
}

/* ── Contact Form ── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span');
    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    setTimeout(() => {
      btn.textContent = '✓ Sent! We\'ll be in touch soon.';
      form.reset();
      setTimeout(() => { btn.textContent = orig; }, 4000);
    }, 1200);
  });
}

/* ── Tilt on service cards ── */
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
