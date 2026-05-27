/**
 * Gaal Hairplay — Generative Background
 * Three depth layers with parallax + theme-aware palette
 */
(function () {
  const BG = document.getElementById('bg');
  if (!BG) return;

  const COLORS_DARK = [
    ['#c9a96e', '#0c0b09'],
    ['#8c6e3f', '#0c0b09'],
    ['#e2c99a', '#111009'],
    ['#6b4f22', '#0c0b09'],
  ];
  const COLORS_LIGHT = [
    ['#c9a96e', '#f2ece0'],
    ['#8c6e3f', '#ede6d6'],
    ['#e2c99a', '#f2ece0'],
    ['#d4a96e', '#e6dece'],
  ];
  function getColors() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? COLORS_DARK : COLORS_LIGHT;
  }

  const SHAPES = [
    'polygon(0% 15%, 85% 0%, 100% 85%, 15% 100%)',
    'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    'polygon(0% 0%, 100% 20%, 80% 100%, 20% 80%)',
    'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    'polygon(0% 25%, 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%)',
    'polygon(10% 0%, 90% 10%, 100% 90%, 0% 100%)',
    'polygon(0% 0%, 70% 0%, 100% 30%, 100% 100%, 30% 100%, 0% 70%)',
  ];

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const LAYERS = [
    { depth: 0.04, polygons: 4, lines: 5, opacityRange: [0.04, 0.09], blurRange: [14, 20], sizeRange: [40, 90] },
    { depth: 0.10, polygons: 4, lines: 4, opacityRange: [0.06, 0.13], blurRange: [5, 10],  sizeRange: [25, 60] },
    { depth: 0.20, polygons: 3, lines: 3, opacityRange: [0.08, 0.16], blurRange: [0, 3],   sizeRange: [15, 40] },
  ];

  const layerEls = [];

  function generateLayer(cfg, wrap) {
    wrap.innerHTML = '';
    for (let i = 0; i < cfg.polygons; i++) {
      const el = document.createElement('div');
      el.className = 'bg-poly';
      const [c1, c2] = pick(getColors());
      el.style.cssText = `
        left: ${rand(-10,90)}%; top: ${rand(-10,90)}%;
        width: ${rand(cfg.sizeRange[0],cfg.sizeRange[1])}vw;
        height: ${rand(cfg.sizeRange[0],cfg.sizeRange[1])}vw;
        background: linear-gradient(${rand(0,360)}deg, ${c1}, ${c2});
        clip-path: ${pick(SHAPES)};
        transform: rotate(${rand(-60,60)}deg);
        opacity: ${rand(cfg.opacityRange[0],cfg.opacityRange[1])};
        filter: blur(${rand(cfg.blurRange[0],cfg.blurRange[1])}px);
      `;
      wrap.appendChild(el);
    }
    for (let i = 0; i < cfg.lines; i++) {
      const el = document.createElement('div');
      el.className = 'bg-line';
      const [c1] = pick(getColors());
      el.style.cssText = `
        left: ${rand(-30,100)}%; top: ${rand(0,100)}%;
        width: ${rand(60,200)}vw; height: ${rand(0.5,2.5)}px;
        background: linear-gradient(${rand(0,360)}deg, transparent, ${c1}, transparent);
        transform: rotate(${rand(-50,50)}deg);
        opacity: ${rand(0.06,0.22)};
        filter: blur(${rand(cfg.blurRange[0]*.5,cfg.blurRange[1]*.5)}px);
      `;
      wrap.appendChild(el);
    }
  }

  LAYERS.forEach(cfg => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-layer';
    wrap.dataset.depth = cfg.depth;
    BG.appendChild(wrap);
    layerEls.push(wrap);
    generateLayer(cfg, wrap);
  });

  new MutationObserver(() => {
    LAYERS.forEach((cfg, i) => generateLayer(cfg, layerEls[i]));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let mx = 0, my = 0, cx = 0, cy = 0, ticking = false;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  });
  function tick() {
    ticking = false;
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    layerEls.forEach(wrap => {
      const d = parseFloat(wrap.dataset.depth);
      wrap.style.transform = `translate(${cx*d*60}px, ${cy*d*40}px)`;
    });
    if (Math.abs(mx-cx) > 0.001 || Math.abs(my-cy) > 0.001) {
      ticking = true; requestAnimationFrame(tick);
    }
  }
})();
