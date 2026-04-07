/* =====================================================
   IntelliLar Landing Page — main.js
   ===================================================== */

// ── Theme toggle (light/dark) ────────────────────────
const THEME_STORAGE_KEY = 'intellilar-theme';
const THEME_META_COLORS = {
  dark: '#0f172a',
  light: '#f3f7ff'
};

const rootElement = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeColorMeta = document.getElementById('theme-color-meta');
const themeToggleText = document.querySelector('.theme-toggle-text');

function applyTheme(theme) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark';
  rootElement.setAttribute('data-theme', normalizedTheme);

  if (themeToggle) {
    const nextActionLabel = normalizedTheme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    const currentThemeLabel = normalizedTheme === 'dark' ? 'Tema escuro ativo' : 'Tema claro ativo';
    themeToggle.setAttribute('aria-label', nextActionLabel);
    themeToggle.setAttribute('title', nextActionLabel);
    themeToggle.setAttribute('aria-checked', normalizedTheme === 'light' ? 'true' : 'false');

    if (themeToggleText) {
      themeToggleText.textContent = currentThemeLabel;
    }
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', THEME_META_COLORS[normalizedTheme]);
  }
}

applyTheme(rootElement.getAttribute('data-theme'));

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = rootElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      // Keep working without persistence if storage is blocked.
    }
  });
}

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
