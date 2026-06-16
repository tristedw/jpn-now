import { bootPage } from "../site.js";

bootPage();

function setupStoreMotion() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ST);

  const shell = document.querySelector('.store-shell');
  if (shell) {
    gsap.from(shell, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: shell, start: 'top 86%' },
    });
  }

  const chips = document.querySelectorAll('.store-chip');
  if (chips.length) {
    gsap.from(chips, {
      opacity: 0,
      y: 10,
      stagger: 0.08,
      duration: 0.45,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.store-shell', start: 'top 86%' },
    });
  }

  const cards = document.querySelectorAll('.product-card');
  if (cards.length) {
    gsap.from(cards, {
      opacity: 0,
      y: 28,
      stagger: 0.12,
      duration: 0.72,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.product-grid', start: 'top 88%' },
    });
  }
}

if (window.gsap && window.ScrollTrigger) {
  setupStoreMotion();
} else {
  window.addEventListener('load', setupStoreMotion, { once: true });
}
