function getGsap() { return window.gsap; }

//  Navigation 

export function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const gsap = getGsap();

  function openNav() {
    if (gsap) gsap.killTweensOf(nav);
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (gsap) gsap.fromTo(nav, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' });
  }

  function closeNav() {
    if (gsap) gsap.killTweensOf(nav);
    toggle.setAttribute('aria-expanded', 'false');
    if (gsap) {
      gsap.to(nav, {
        autoAlpha: 0, y: -8, duration: 0.18, ease: 'power2.in',
        onComplete: () => nav.classList.remove('is-open'),
      });
    } else {
      nav.classList.remove('is-open');
    }
  }

  toggle.addEventListener('click', () => nav.classList.contains('is-open') ? closeNav() : openNav());
  nav.querySelectorAll('a, button').forEach(el => {
    if (!el.hasAttribute('data-modal-open')) el.addEventListener('click', closeNav);
  });
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('is-open')) closeNav();
  });
  document.addEventListener('site:open-nav', openNav);
  document.addEventListener('site:close-nav', closeNav);
}

export function setupActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.site-nav a').forEach(link => {
    const href = link.getAttribute('href');
    const target = href
      ?.split('#')[0]
      .split('?')[0]
      .replace(/^\.\//, '')
      .replace(/\/$/, '');

    const normalizedTarget = target === 'index.html' || target === 'index' || target === '/' ? 'home' : target?.replace('.html', '');

    if (normalizedTarget === page)
      link.setAttribute('aria-current', 'page');
  });
}

//  Lenis ─

export function setupLenis() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (typeof window.Lenis !== 'function') return null;
  const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  return lenis;
}

//  Hero entrance 

export function setupHeroMotion() {
  const gsap = getGsap();
  if (!gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Inner-page heroes
  const ph = document.querySelector('.page-hero');
  if (ph) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const ew = ph.querySelector('.eyebrow');
    const h1 = ph.querySelector('h1');
    const ld = ph.querySelector('.lede');
    const ac = ph.querySelector('.hero-actions');
    if (ew) tl.from(ew, { opacity: 0, y: 14, duration: 0.55 }, 0.05);
    if (h1) tl.from(h1, { opacity: 0, y: 32, duration: 0.88 }, 0.12);
    if (ld) tl.from(ld, { opacity: 0, y: 22, duration: 0.72 }, 0.28);
    if (ac) tl.from(ac, { opacity: 0, y: 16, duration: 0.65 }, 0.44);
    return;
  }

  // Home hero
  if (!document.querySelector('.hero-inner')) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero .eyebrow',  { opacity: 0, y: 14, duration: 0.55 }, 0)
    .from('.hero h1',        { opacity: 0, y: 38, duration: 0.96 }, 0.1)
    .from('.hero .lede',     { opacity: 0, y: 24, duration: 0.76 }, 0.28)
    .from('.hero-actions',   { opacity: 0, y: 18, duration: 0.66 }, 0.44)
    .from('.hero-panel',     { opacity: 0, x: 30, duration: 0.85, ease: 'power2.out' }, 0.32);

  const metricItems = document.querySelectorAll('.metrics .metric');
  if (metricItems.length) tl.from(metricItems, { opacity: 0, y: 18, stagger: 0.1, duration: 0.6 }, 0.54);
}

//  Parallax 

export function setupParallax() {
  const gsap = getGsap();
  const ST   = window.ScrollTrigger;
  if (!gsap || !ST || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const img = document.querySelector('.hero-bg-img');
  if (!img) return;
  gsap.registerPlugin(ST);
  gsap.to(img, {
    yPercent: 20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

//  Scroll reveals 

export function setupRevealAnimations() {
  const gsap = getGsap();
  const ST   = window.ScrollTrigger;
  if (!gsap || !ST || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ST);
  const tracked = new WeakSet();
  const base = { opacity: 0, y: 32, duration: 0.72, ease: 'power2.out' };

  // Grid children  auto-stagger
  '.card-grid, .service-stack, .service-detail, .pricing-layout, .contact-grid, .order-grid, .footer-grid'
    .split(', ')
    .forEach(sel => {
      document.querySelectorAll(sel).forEach(grid => {
        const items = [...grid.children].filter(el => !el.closest('.hero, .hero-inner'));
        if (items.length < 2) return;
        items.forEach(el => tracked.add(el));
        gsap.from(items, { ...base, stagger: 0.1, scrollTrigger: { trigger: grid, start: 'top 88%' } });
      });
    });

  // Section-split  stagger both halves
  document.querySelectorAll('.section-split').forEach(sec => {
    const items = [...sec.children];
    if (!items.length) return;
    items.forEach(el => tracked.add(el));
    gsap.from(items, { ...base, stagger: 0.14, scrollTrigger: { trigger: sec, start: 'top 86%' } });
  });

  // Price-list rows — both in .pricing-card and standalone .price-list
  document.querySelectorAll('.price-list').forEach(list => {
    const rows = [...list.querySelectorAll('li')];
    if (!rows.length) return;
    rows.forEach(el => tracked.add(el));
    gsap.from(rows, {
      opacity: 0, y: 10, stagger: 0.04, duration: 0.45, ease: 'power2.out',
      scrollTrigger: { trigger: list, start: 'top 88%' },
    });
  });

  // Metrics outside hero
  document.querySelectorAll('.metrics').forEach(grid => {
    if (grid.closest('.hero, .hero-inner')) return;
    const items = [...grid.children];
    items.forEach(el => tracked.add(el));
    gsap.from(items, {
      opacity: 0, y: 20, stagger: 0.08, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: grid, start: 'top 90%' },
    });
  });

  // Individual [data-reveal] (skip hero / page-hero / already tracked)
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (tracked.has(el) || el.closest('.hero, .hero-inner, .page-hero')) return;
    gsap.from(el, { opacity: 0, y: 28, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 91%' } });
  });
}

//  Micro-interactions ─

export function setupMicroInteractions() {
  const gsap = getGsap();
  if (!gsap || window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.card, .service-card, .panel-card, .info-card, .pricing-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(el, { y: -5, duration: 0.28, ease: 'power2.out' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { y:  0, duration: 0.35, ease: 'power2.out' }));
  });

  document.querySelectorAll('.button-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.045, duration: 0.22, ease: 'power2.out' }));
    btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1,     duration: 0.28, ease: 'power2.out' }));
  });
}

//  Quote modal 

export function setupModal() {
  const overlay = document.getElementById('quote-modal');
  if (!overlay) return;

  const card = overlay.querySelector('.modal-card');
  const gsap = getGsap();
  let shouldRestoreNav = false;

  function openModal() {
    const nav = document.querySelector('.site-nav');
    const isMobileMenu = window.matchMedia('(max-width: 860px)').matches;
    shouldRestoreNav = !!nav && nav.classList.contains('is-open') && isMobileMenu;
    if (shouldRestoreNav) {
      document.dispatchEvent(new CustomEvent('site:close-nav'));
    }
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (gsap) {
      gsap.killTweensOf([overlay, card]);
      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26, ease: 'power2.out' });
      gsap.fromTo(card,
        { scale: 0.88, y: 32, autoAlpha: 0 },
        { scale: 1,    y: 0,  autoAlpha: 1, duration: 0.44, delay: 0.05, ease: 'back.out(1.5)' }
      );
    }
    setTimeout(() => overlay.querySelector('input, select, textarea')?.focus(), 110);
  }

  function closeModal() {
    if (gsap) {
      gsap.killTweensOf([overlay, card]);
      gsap.to(card,    { scale: 0.93, y: 14, autoAlpha: 0, duration: 0.22, ease: 'power2.in' });
      gsap.to(overlay, {
        autoAlpha: 0, duration: 0.3, delay: 0.06, ease: 'power2.in',
        onComplete: () => {
          overlay.setAttribute('aria-hidden', 'true');
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';
          if (shouldRestoreNav) {
            document.dispatchEvent(new CustomEvent('site:open-nav'));
            shouldRestoreNav = false;
          }
        },
      });
    } else {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      if (shouldRestoreNav) {
        document.dispatchEvent(new CustomEvent('site:open-nav'));
        shouldRestoreNav = false;
      }
    }
  }

  document.querySelectorAll('[data-modal-open]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openModal(); });
  });
  document.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
}

//  Form submit 

export function setupFormSubmit() {
  document.querySelectorAll('.quote-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn       = form.querySelector('[type="submit"]');
      const successEl = form.querySelector('.form-success');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (res.ok) {
          form.querySelectorAll('.form-field, .form-row, .form-actions').forEach(el => (el.hidden = true));
          if (successEl) {
            successEl.hidden = false;
            const gsap = getGsap();
            if (gsap) gsap.from(successEl, { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out' });
          }
        } else {
          btn.disabled = false;
          btn.textContent = 'Send request';
          alert('Something went wrong. Please try again or DM us on Instagram @jpn.now');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Send request';
        alert('Network error. Please try again.');
      }
    });
  });
}

// ─ Boot 

export function bootPage() {
  setupNavigation();
  setupActiveNav();
  setupModal();
  setupFormSubmit();

  function runAnimations() {
    setupLenis();
    setupHeroMotion();
    setupParallax();
    setupRevealAnimations();
    setupMicroInteractions();
  }

  if (window.gsap && window.ScrollTrigger) {
    runAnimations();
  } else {
    window.addEventListener('load', runAnimations, { once: true });
  }
}
