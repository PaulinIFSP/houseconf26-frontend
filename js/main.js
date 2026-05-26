/* ──────────────────────────────────────────────
   HOUSE CONF 26 — interações
   ────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Partículas de fogo no hero ────────────── */
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    const count = window.innerWidth < 640 ? 18 : 36;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() > 0.7 ? 3 : 2;
      p.style.cssText = [
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `width:${size}px`,
        `height:${size}px`,
        `animation-duration:${8 + Math.random() * 16}s`,
        `animation-delay:${Math.random() * 12}s`,
      ].join(';');
      particlesContainer.appendChild(p);
    }
  }

  /* ── Header com background no scroll ───────── */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll-reveal ─────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ── FAQ accordion ─────────────────────────── */
  window.toggleFaq = function (el) {
    const item = el.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  };

  /* ── Countdown ─────────────────────────────── */
  const target = new Date('2026-09-11T19:00:00-03:00');
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
    container: document.getElementById('countdown'),
  };
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
  function updateCountdown() {
    const diff = target - new Date();
    if (diff <= 0) {
      if (els.container) {
        els.container.innerHTML =
          '<p style="font-family:var(--font-display);font-size:2rem;color:var(--cream);letter-spacing:0.1em;font-weight:700">O evento começou!</p>';
      }
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.days)  els.days.textContent  = pad(d);
    if (els.hours) els.hours.textContent = pad(h);
    if (els.mins)  els.mins.textContent  = pad(m);
    if (els.secs)  els.secs.textContent  = pad(s);
  }
  if (els.container) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ── Menu mobile ───────────────────────────── */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('header nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });
    // fecha menu ao clicar num link
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }

  /* ── Smooth scroll para âncoras (fallback) ─── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
