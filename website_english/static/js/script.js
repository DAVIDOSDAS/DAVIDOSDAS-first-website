// script.js - Global site interactions

document.addEventListener('DOMContentLoaded', () => {

  // ── Cached elements ────────────────────────────────────────
  const navbar    = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  const hero      = document.querySelector('.hero');
  const heroSpan  = document.querySelector('h1 span');

// ── Navbar scroll effect ───────────────────────────────────

let lastScroll = 0;

const onScroll = () => {
  const currentScroll = window.scrollY;

  // Scrolled state (triggers liquid glass + slight lift)
  navbar?.classList.toggle('scrolled', currentScroll > 50);

  // Hide navbar when scrolling down, show when scrolling up
  if (currentScroll > lastScroll && currentScroll > 100) {
    navbar?.classList.add('hidden');
  } else {
    navbar?.classList.remove('hidden');
  }

  // Back to top button
  if (backToTop) {
    backToTop.classList.toggle('show', currentScroll > 500);
  }

  // Optional hero parallax
  if (hero) {
    hero.style.backgroundPositionY = `${currentScroll * 0.3}px`;
  }

  lastScroll = currentScroll;
};

// Use passive listener for better performance
window.addEventListener('scroll', onScroll, { passive: true });

  // ── Back to top ────────────────────────────────────────────
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Smooth scroll for anchor links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Hero text scramble on hover ────────────────────────────
  if (heroSpan) {
    const original = heroSpan.textContent;
    const chars = 'АБВГДЕЖЗИЈКЛМНОПРСТУФХЦЧЏШ';

    heroSpan.addEventListener('mouseenter', () => {
      let i = 0;
      const scramble = setInterval(() => {
        heroSpan.textContent = original
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            return idx < i
              ? original[idx]
              : chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        i += 0.4;
        if (i >= original.length) {
          heroSpan.textContent = original;
          clearInterval(scramble);
        }
      }, 30);
    });

    heroSpan.addEventListener('mouseleave', () => {
      heroSpan.textContent = original;
    });
  }

  // ── Scroll reveal (fade-in & bg-fade) ─────────────────────
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('bg-fade')) {
            revealObserver.unobserve(entry.target);
          }
        } else if (!entry.target.classList.contains('bg-fade')) {
          entry.target.classList.remove('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.fade-in, .bg-fade, .fade-section').forEach(el => {
    revealObserver.observe(el);
  });

  // ── Staggered animation for card grids ────────────────────
  document.querySelectorAll(
    '.feature-cards, .program-grid, .testimonials-grid, .news-grid, .smerovi-grid'
  ).forEach(grid => {
    const children = grid.querySelectorAll(
      '.feature-card, .program-card, .testimonial-card, .news-card, .smer-card'
    );
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 60}ms`;
      revealObserver.observe(child);
    });
  });

  // ── Button ripple effect ───────────────────────────────────
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-load-more, .btn-calc').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(255,255,255,0.25);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.5s ease-out forwards;
        pointer-events: none;
      `;
      if (getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── Stat numbers count-up animation ───────────────────────
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      const num = parseFloat(text.replace(/[^0-9.]/g, ''));
      const suffix = text.replace(/[0-9.]/g, '');
      if (isNaN(num)) return;

      let start = 0;
      const duration = 1600;
      const step = num / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= num) {
          start = num;
          clearInterval(timer);
        }
        el.textContent = (Number.isInteger(num) ? Math.round(start) : start.toFixed(1)) + suffix;
      }, 16);

      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

  // ── Hamburger menu ─────────────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navMenu   = document.querySelector('.nav-menu');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
  });

  // Close nav on link click (mobile)
  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Progress bars ──────────────────────────────────────────
  document.querySelectorAll('.progress-bar').forEach(bar => {
    const target = parseInt(bar.dataset.target, 10);
    if (isNaN(target)) return;
    const text = bar.querySelector('.progress-text');

    const barObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let current = 0;
      const step = target / (1800 / 16);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        if (text) text.textContent = Math.round(current) + (target <= 100 ? '%' : '+');
      }, 16);
      bar.style.width = `${target <= 100 ? target : 100}%`;
      barObserver.disconnect();
    }, { threshold: 0.5 });

    barObserver.observe(bar);
  });

  // ── Hero search ────────────────────────────────────────────
  const searchInput = document.getElementById('hero-search-input');
  const searchBtn   = document.querySelector('.hero-search button');

  const doSearch = () => {
    const q = searchInput?.value.trim();
    if (q) window.location.href = `news.html?search=${encodeURIComponent(q)}`;
  };

  searchBtn?.addEventListener('click', doSearch);
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  // ── Custom dropdowns ───────────────────────────────────────
  document.querySelectorAll('.custom-dropdown-wrapper').forEach(wrapper => {
    const trigger          = wrapper.querySelector('.custom-select');
    const optionsContainer = wrapper.querySelector('.custom-options');
    const hiddenSelect     = wrapper.querySelector('select');
    const selected         = wrapper.querySelector('.selected-value');
    const options          = wrapper.querySelectorAll('.option');

    const toggle = () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);
      optionsContainer?.setAttribute('aria-hidden', expanded);
    };

    trigger?.addEventListener('click', toggle);
    trigger?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (selected) selected.textContent = opt.textContent;
        if (hiddenSelect) hiddenSelect.value = opt.dataset.value;
        options.forEach(o => o.removeAttribute('aria-selected'));
        opt.setAttribute('aria-selected', 'true');
        toggle();
      });
    });

    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) {
        trigger?.setAttribute('aria-expanded', 'false');
        optionsContainer?.setAttribute('aria-hidden', 'true');
      }
    });
  });
});

// ── Ripple keyframe (injected once) ─────────────────────────
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);
