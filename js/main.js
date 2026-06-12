/* main.js — Gaal Hairplay */
'use strict';

/* ────────────────────────────────────────
   LANGUAGE TOGGLE
   data-ro / data-en on every translatable element
─────────────────────────────────────────── */
const LANG_KEY = 'gaal-lang';

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'ro';
}

function applyLang(lang) {
  document.querySelectorAll('[data-ro]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (!val) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
      // keep child elements (icons etc), only update text nodes
      const textNode = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (textNode) textNode.textContent = val;
      else el.textContent = val;
    } else {
      el.textContent = val;
    }
  });
  // Update typed source words if any
  document.querySelectorAll('[data-typed-ro]').forEach(el => {
    const words = JSON.parse(el.getAttribute('data-typed-' + lang) || '[]');
    if (words.length && el._typedUpdate) el._typedUpdate(words);
  });
  // Toggle label states
  document.querySelectorAll('.lang-ro').forEach(el => el.classList.toggle('active', lang === 'ro'));
  document.querySelectorAll('.lang-en').forEach(el => el.classList.toggle('active', lang === 'en'));
}

function initLang() {
  const lang = getLang();
  applyLang(lang);
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getLang() === 'ro' ? 'en' : 'ro';
      localStorage.setItem(LANG_KEY, next);
      applyLang(next);
    });
  });
}

/* ────────────────────────────────────────
   NAVBAR
─────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 80);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const current = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === current || (current === '' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ────────────────────────────────────────
   MOBILE NAV
─────────────────────────────────────────── */
function initMobileNav() {
  const burger = document.querySelector('.burger');
  const mNav   = document.querySelector('.mobile-nav');
  if (!burger || !mNav) return;
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mNav.classList.toggle('open', open);
  });
  // close on link click
  mNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    mNav.classList.remove('open');
  }));
}

/* ────────────────────────────────────────
   HERO SLIDER
─────────────────────────────────────────── */
function initHeroSlider() {
  const slides  = [...document.querySelectorAll('.hero-slide')];
  const bullets = [...document.querySelectorAll('.hero-bullet')];
  if (!slides.length) return;

  let cur = 0, timer;

  function goTo(idx) {
    slides[cur].classList.remove('active');
    bullets[cur]?.classList.remove('active');
    cur = (idx + slides.length) % slides.length;
    const slide = slides[cur];
    slide.classList.add('active');
    bullets[cur]?.classList.add('active');
    // restart ken-burns
    const bg = slide.querySelector('.slide-bg');
    if (bg) { bg.style.animation = 'none'; void bg.offsetWidth; bg.style.animation = 'kenburns 14s ease-out forwards'; }
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), 5200);
  }

  bullets.forEach((b, i) => b.addEventListener('click', () => { goTo(i); start(); }));
  goTo(0);
  start();
}

/* ────────────────────────────────────────
   SERVICE / PRICE TABS
─────────────────────────────────────────── */
function initTabs() {
  const btns   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b  => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab)?.classList.add('active');
  }));
}

/* ────────────────────────────────────────
   TESTIMONIALS SLIDER
─────────────────────────────────────────── */
function initTestimonials() {
  const track  = document.querySelector('.testimonials-track');
  const dots   = [...document.querySelectorAll('.t-dot')];
  if (!track) return;
  const slides = [...track.querySelectorAll('.testimonial-slide')];
  const perView = () => window.innerWidth <= 768 ? 1 : 2;
  let cur = 0, timer;

  function goTo(idx) {
    const pv = perView();
    const max = Math.max(0, slides.length - pv);
    cur = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${cur * (100 / pv)}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => {
      const pv = perView();
      goTo(cur + pv < slides.length ? cur + 1 : 0);
    }, 5000);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); start(); }));
  goTo(0);
  start();
}

/* ────────────────────────────────────────
   TYPED TEXT
─────────────────────────────────────────── */
function initTyped() {
  document.querySelectorAll('[data-typed-ro]').forEach(el => {
    let words = JSON.parse(el.getAttribute('data-typed-' + getLang()) || '[]');
    if (!words.length) return;
    let wi = 0, ci = 0, deleting = false, running = true, rafId;

    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    cursor.textContent = '|';
    el.after(cursor);

    function tick() {
      if (!running) return;
      const word = words[wi];
      if (!deleting) {
        el.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; rafId = setTimeout(tick, 2000); return; }
      } else {
        el.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      }
      rafId = setTimeout(tick, deleting ? 55 : 85);
    }

    // allow lang switch to update words
    el._typedUpdate = (newWords) => { words = newWords; };
    tick();
  });
}

/* ────────────────────────────────────────
   SCROLL ANIMATIONS
─────────────────────────────────────────── */
function initScrollAnim() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────
   CURSURI — RANDOM YOUTUBE PLAYLIST VIDEO
─────────────────────────────────────────── */
function initCursuriVideo() {
  const container = document.querySelector('.cursuri-img');
  if (!container) return;

  const playlistId = 'PLo4zeGtSbGL8oZeQsD4QNKvAEx9o8CtHh';

  const playerDiv = document.createElement('div');
  playerDiv.id = 'yt-cursuri-player';
  container.appendChild(playerDiv);

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = function() {
    new YT.Player('yt-cursuri-player', {
      playerVars: {
        list:           playlistId,
        listType:       'playlist',
        autoplay:       1,
        mute:           1,
        controls:       0,
        loop:           1,
        disablekb:      1,
        fs:             0,
        modestbranding: 1,
        rel:            0,
        playsinline:    1,
        iv_load_policy: 3
      },
      events: {
        onReady: function(e) {
          e.target.mute();
          const playlist = e.target.getPlaylist();
          if (playlist && playlist.length > 0) {
            e.target.playVideoAt(Math.floor(Math.random() * playlist.length));
          }
          e.target.playVideo();
        }
      }
    });
  };
}

/* ────────────────────────────────────────
   LIGHTBOX
─────────────────────────────────────────── */
function initLightbox() {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  const img   = overlay.querySelector('img');
  const close = overlay.querySelector('.lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.dataset.lightbox;
      img.alt = el.querySelector('img')?.alt || '';
      overlay.classList.add('open');
    });
  });

  const dismiss = () => overlay.classList.remove('open');
  close.addEventListener('click', dismiss);
  overlay.addEventListener('click', e => { if (e.target !== img) dismiss(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') dismiss(); });
}

/* ────────────────────────────────────────
   GO TOP
─────────────────────────────────────────── */
function initGoTop() {
  const btn = document.querySelector('.go-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* ────────────────────────────────────────
   INIT
─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initNavbar();
  initMobileNav();
  initHeroSlider();
  initTabs();
  initTestimonials();
  initTyped();
  initScrollAnim();
  initGoTop();
  initLightbox();
  initCursuriVideo();
});
