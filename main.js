/* ============================================
   IVÁN RODRÍGUEZ – main.js
   Quantum canvas + scroll + interactions
   ============================================ */

// ===== QUANTUM CANVAS =====
(function () {
  const canvas = document.getElementById('quantum-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, connections, animId;

  const COLORS = {
    node: ['rgba(245,166,35,', 'rgba(255,209,102,', 'rgba(6,182,212,', 'rgba(255,140,66,', 'rgba(34,211,238,'],
    line: ['rgba(245,166,35,', 'rgba(6,182,212,', 'rgba(255,209,102,']
  };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    init();
  }

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function init() {
    const count = Math.min(Math.floor(W * H / 12000), 90);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: randBetween(-0.25, 0.25),
      vy: randBetween(-0.25, 0.25),
      r: randBetween(1.2, 3.2),
      color: COLORS.node[Math.floor(Math.random() * COLORS.node.length)],
      alpha: randBetween(0.3, 0.9),
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: randBetween(0.01, 0.03)
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    const maxDist = Math.min(W, H) * 0.22;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.25;
          const color = COLORS.line[Math.floor((i + j) % COLORS.line.length)];
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = color + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.pulse += p.pulseSpeed;
      const pAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + pAlpha + ')';
      ctx.fill();

      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      grad.addColorStop(0, p.color + (pAlpha * 0.4) + ')');
      grad.addColorStop(1, p.color + '0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 200); });
  resize();
  draw();

  // Mouse interaction – attract nearby particles
  let mx = -9999, my = -9999;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
  });
  setInterval(() => {
    const r = 120;
    for (const p of particles) {
      const dx = p.x - mx, dy = p.y - my;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < r) {
        const force = (r - d) / r * 0.3;
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;
        // Dampen speed
        p.vx *= 0.96;
        p.vy *= 0.96;
      }
    }
  }, 30);
})();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ===== MOBILE NAV =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });
}

// ===== REVEAL ON SCROLL =====
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== CARD TILT ON HOVER (subtle 3D) =====
document.querySelectorAll('.service-card, .mv-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== STAT COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const text = el.textContent;
    const isPercent = text.includes('%');
    const isMoney = text.startsWith('0$') || text.startsWith('$');
    const num = parseInt(text.replace(/[^0-9]/g, ''));
    if (!num || num === 0) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      el.textContent = isMoney ? `$${current}` : isPercent ? `${current}%` : current.toString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
  const statsObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
      statsObs.disconnect();
    }
  }, { threshold: 0.5 });
  statsObs.observe(statsSection);
}

// ===== SCROLL PROGRESS BAR =====
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position:fixed;top:0;left:0;height:2px;z-index:9999;
  background:linear-gradient(90deg,#F5A623,#06B6D4);
  transition:width 0.1s linear;width:0%;
`;
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = scrolled + '%';
}, { passive: true });

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--gold)' : '';
  });
}, { passive: true });
