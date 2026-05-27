// ── Theme ──────────────────────────────────────────────────────
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', savedTheme);

function updateLogo() {
  const scrolled = window.scrollY > 40;
  const isLight = root.getAttribute('data-theme') === 'light';
  const navLogo = document.getElementById('logo');
  const footerLogo = document.getElementById('logo-footer');
  const lightSrc = 'static/img/logo-dark.png';
  const darkSrc = 'static/img/logo.png';

  if (navLogo) {
    navLogo.src = (isLight && !scrolled) ? darkSrc : lightSrc;
  }
  if (footerLogo) {
    footerLogo.src = isLight ? lightSrc : darkSrc;
  }
}

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateLogo();
  });
}

// ── Language ───────────────────────────────────────────────────
let currentLang = localStorage.getItem('lang') || 'ro';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'ro' ? 'EN' : 'RO';
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-ro]').forEach(el => {
    const val = el.getAttribute(`data-${lang}`);
    if (val) el.textContent = val;
  });
}
applyLang(currentLang);

const langBtn = document.getElementById('langToggle');
if (langBtn) {
  langBtn.addEventListener('click', () => {
    applyLang(currentLang === 'ro' ? 'en' : 'ro');
  });
}

// ── Nav scroll ─────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 40;
  if (navbar) navbar.classList.toggle('scrolled', scrolled);
  updateLogo();
}, { passive: true });

// ── Hero image parallax + load ─────────────────────────────────
const heroImg = document.getElementById('heroImg');
if (heroImg) {
  heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
  if (heroImg.complete) heroImg.classList.add('loaded');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroImg.style.transform = `scale(1) translateY(${y * 0.1}px)`;
  }, { passive: true });
}

// ── Mobile burger ──────────────────────────────────────────────
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

function openBurger() {
  navLinks.classList.add('open');
  navbar.style.background = 'var(--bg)';
  navbar.style.backdropFilter = 'none';
  document.body.style.overflow = 'hidden';
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = 'rotate(45deg) translate(4px,4px)';
  spans[1].style.opacity   = '0';
  spans[2].style.transform = 'rotate(-45deg) translate(4px,-4px)';
}
function closeBurger() {
  navLinks.classList.remove('open');
  navbar.style.background = '';
  navbar.style.backdropFilter = '';
  document.body.style.overflow = '';
  burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeBurger() : openBurger();
  });
  navLinks.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', closeBurger);
  });
}

// ── Modals ─────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const sw = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = sw + 'px';
  document.body.style.overflow = 'hidden';
  el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

document.querySelectorAll('.modal-backdrop').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
});

// Gallery
const heroGallery = document.getElementById('heroGallery');
if (heroGallery) heroGallery.addEventListener('click', () => openModal('galleryModal'));

// Service items → modals
document.querySelectorAll('.svc-item[data-open]').forEach(item => {
  item.addEventListener('click', () => openModal(item.dataset.open));
});

// ── Fade-up observer ───────────────────────────────────────────
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

// ── Curtain reveal observer ────────────────────────────────────
const curtainObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      curtainObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.curtain-wrap').forEach(el => curtainObs.observe(el));

// ── Hero text reveal ───────────────────────────────────────────
document.querySelectorAll('.reveal-inner').forEach((el, i) => {
  setTimeout(() => el.classList.add('visible'), 200 + i * 130);
});

// ── Page transition bar ────────────────────────────────────────
const bar = document.createElement('div');
bar.id = 'page-bar';
document.body.appendChild(bar);

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
  link.addEventListener('click', e => {
    e.preventDefault();
    bar.style.width = '100%';
    setTimeout(() => { window.location.href = href; }, 380);
  });
});
window.addEventListener('pageshow', () => {
  bar.style.transition = 'none';
  bar.style.width = '0%';
});

// ── YouTube Random Autoplayer (Cursuri Page) ───────────────────
const ytScript = document.createElement('script');
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

let ytPlayer;

function onYouTubeIframeAPIReady() {
  // Check if the element exists so we don't throw errors on pages without the video
  if (!document.getElementById('yt-player')) return;

  ytPlayer = new YT.Player('yt-player', {
    playerVars: {
      'listType': 'playlist',
      'list': 'PLo4zeGtSbGL8oZeQsD4QNKvAEx9o8CtHh', // Your playlist
      'controls': 0,           // Hide controls for a cleaner look
      'disablekb': 1,          // Disable keyboard interactions
      'fs': 0,                 // No fullscreen
      'rel': 0,                // Hide related videos
      'modestbranding': 1,     // Remove YouTube logo where possible
      'playsinline': 1         // Required for iOS/Mobile background autoplay
    },
    events: {
      'onReady': (event) => {
        event.target.mute(); 
        event.target.setShuffle(true);
        
        // Wait a split second to ensure shuffle registers, then play
        setTimeout(() => {
          event.target.nextVideo();
          event.target.playVideo();
        }, 150);
      }
    }
  });
}