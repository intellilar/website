/* =====================================================
   IntelliLar Landing Page — main.js
   ===================================================== */

// ── Marquee ───────────────────────────────────────────
(function initMarquees() {
  document.querySelectorAll('.marquee-track').forEach(track => {
    const reverse = track.classList.contains('marquee-track--right');
    const SPEED   = 0.0625; // px por ms (~3.75px/s)

    track.style.animation = 'none';

    let pos       = 0;
    let paused    = false;
    let lastStamp = null; // null = recalcular no próximo frame

    const wrap = track.closest('.marquee-track-wrap');
    wrap.addEventListener('mouseenter', () => { paused = true; });
    wrap.addEventListener('mouseleave', () => { paused = false; });

    // Ao esconder a aba: pausa e descarta o timestamp acumulado
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        paused     = true;
        lastStamp  = null; // evita salto gigante ao retornar
      } else {
        paused = false;
      }
    });

    const tick = (timestamp) => {
      // 4 cópias do set → reset a cada 1/4 do track total
      const quarter = track.scrollWidth / 4;

      if (quarter > 0 && !paused) {
        if (lastStamp !== null) {
          // Limita delta a 32ms para absorver pausas/retomadas sem salto
          const delta = Math.min(timestamp - lastStamp, 32);
          const move  = SPEED * delta;

          pos += reverse ? move : -move;
          if (!reverse && pos <= -quarter) pos += quarter;
          if ( reverse && pos >=  0)       pos -= quarter;

          track.style.transform = `translate3d(${pos}px, 0, 0)`;
        }
        lastStamp = timestamp;
      } else if (!paused) {
        lastStamp = null;
      }

      requestAnimationFrame(tick);
    };

    const start = () => {
      if (reverse) pos = -(track.scrollWidth / 4);
      requestAnimationFrame(tick);
    };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start);
    }
  });
})();

// ── Footer year ──────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Navbar scroll behavior ───────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile menu ──────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// ── Scroll animations (Intersection Observer) ────────
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

// ── Smooth scroll for anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Contact form feedback (when Formspree not yet configured) ──
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    if (form.action.endsWith('#') || form.action === window.location.href) {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Mensagem enviada! Em breve entraremos em contato.';
      btn.disabled = true;
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 4000);
    }
  });
}

// ── Hero automation scene ────────────────────────────
(function initAutomationHero() {
  const stage = document.getElementById('automation-stage');
  const modeButtons = Array.from(document.querySelectorAll('.automation-mode-btn'));
  const frontRain = document.querySelector('.rain.front-row');
  const backRain = document.querySelector('.rain.back-row');

  if (!stage || modeButtons.length === 0 || !frontRain || !backRain) return;

  const buildRain = (target, density = 48, seedOffset = 0) => {
    let html = '';
    for (let i = 0; i < density; i += 1) {
      const left = ((i * 37 + seedOffset * 53) % 100) + Math.random();
      const delay = Math.random() * 1.2;
      const duration = 0.42 + Math.random() * 0.35;
      const opacity = 0.34 + Math.random() * 0.45;
      const stemHeight = 52 + Math.round(Math.random() * 22);

      html += `
        <div class="drop" style="left:${left.toFixed(2)}%;opacity:${opacity.toFixed(2)};animation-delay:${delay.toFixed(2)}s;animation-duration:${duration.toFixed(2)}s;">
          <div class="stem" style="height:${stemHeight}%;animation-delay:${delay.toFixed(2)}s;animation-duration:${duration.toFixed(2)}s;"></div>
          <div class="splat" style="animation-delay:${delay.toFixed(2)}s;animation-duration:${duration.toFixed(2)}s;"></div>
        </div>
      `;
    }
    target.innerHTML = html;
  };

  buildRain(frontRain, 68, 1);
  buildRain(backRain, 54, 11);

  const setMode = (mode) => {
    stage.setAttribute('data-mode', mode);

    modeButtons.forEach((btn) => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

  };

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const modes = modeButtons.map((btn) => btn.dataset.mode);
    const activeMode = stage.getAttribute('data-mode') || 'sun';
    const index = modes.indexOf(activeMode);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + step + modes.length) % modes.length;
    setMode(modes[next]);
  });
})();
