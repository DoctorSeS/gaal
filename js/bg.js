/* bg.js — generative polygon background */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  Object.assign(canvas.style, {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    zIndex: '-1', pointerEvents: 'none', opacity: '0.45'
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, polys = [];
  const mouse = { x: 0, y: 0 };
  const COLORS = [
    'rgba(201,169,110,0.04)', 'rgba(201,169,110,0.06)',
    'rgba(201,169,110,0.02)', 'rgba(255,255,255,0.015)',
    'rgba(201,169,110,0.03)'
  ];
  const N = 20;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    generate();
  }

  function generate() {
    polys = [];
    for (let i = 0; i < N; i++) {
      polys.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 200 + 50,
        sides: Math.floor(Math.random() * 3) + 3,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() - 0.5) * 0.004,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        px: Math.random() * 0.035 + 0.005,
        ox: 0, oy: 0
      });
    }
  }

  function draw(p) {
    ctx.beginPath();
    for (let i = 0; i < p.sides; i++) {
      const a = p.angle + (Math.PI * 2 / p.sides) * i;
      const x = p.x + p.ox + Math.cos(a) * p.r;
      const y = p.y + p.oy + Math.sin(a) * p.r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    polys.forEach(p => {
      p.angle += p.speed;
      p.ox += (mouse.x * p.px - p.ox) * 0.04;
      p.oy += (mouse.y * p.px - p.oy) * 0.04;
      draw(p);
    });
    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX - W / 2;
    mouse.y = e.clientY - H / 2;
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  frame();
})();
