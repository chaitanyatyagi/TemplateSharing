// Interactive mouse-trail canvas.
//
// Adapted from a 21st.dev component that originally shipped as TypeScript for a
// Next.js/shadcn stack. Rewritten here as framework-agnostic plain JS to match
// this project (Vite + JSX), tuned to the brand blue palette instead of the
// original full-rainbow trails, and given proper teardown so it can live inside
// a React component without leaking event listeners or animation frames.
//
// `renderCanvas(canvas, options)` starts the animation on the given <canvas>
// element and returns a `stop()` function that fully cleans everything up.

export function renderCanvas(canvas, options = {}) {
  const cfg = {
    friction: 0.5,
    trails: 80,
    size: 50,
    dampening: 0.025,
    tension: 0.99,
    // Brand-blue hue oscillation (cyan-blue -> blue) rather than full rainbow.
    hueOffset: 210,
    hueAmplitude: 28,
    lineWidth: 8,
    alpha: 0.045,
    ...options,
  };

  const ctx = canvas.getContext("2d");
  const pos = { x: canvas.width * 0.5, y: canvas.height * 0.5 };
  let lines = [];
  let running = true;
  let rafId = null;

  // Oscillator drives the animated hue so the trails shift subtly over time.
  function Oscillator(opts) {
    this.phase = opts.phase || 0;
    this.offset = opts.offset || 0;
    this.frequency = opts.frequency || 0.001;
    this.amplitude = opts.amplitude || 1;
    this.value = 0;
  }
  Oscillator.prototype.update = function () {
    this.phase += this.frequency;
    this.value = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.value;
  };

  const hue = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: cfg.hueAmplitude,
    frequency: 0.0015,
    offset: cfg.hueOffset,
  });

  function Node() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }

  function Line(opts) {
    this.spring = opts.spring + 0.1 * Math.random() - 0.05;
    this.friction = cfg.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (let i = 0; i < cfg.size; i++) {
      const node = new Node();
      node.x = pos.x;
      node.y = pos.y;
      this.nodes.push(node);
    }
  }
  Line.prototype.update = function () {
    let spring = this.spring;
    let node = this.nodes[0];
    node.vx += (pos.x - node.x) * spring;
    node.vy += (pos.y - node.y) * spring;
    for (let i = 0, len = this.nodes.length; i < len; i++) {
      node = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        node.vx += (prev.x - node.x) * spring;
        node.vy += (prev.y - node.y) * spring;
        node.vx += prev.vx * cfg.dampening;
        node.vy += prev.vy * cfg.dampening;
      }
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= cfg.tension;
    }
  };
  Line.prototype.draw = function () {
    let x = this.nodes[0].x;
    let y = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let a;
    let b;
    let i = 1;
    const end = this.nodes.length - 2;
    for (; i < end; i++) {
      a = this.nodes[i];
      b = this.nodes[i + 1];
      x = 0.5 * (a.x + b.x);
      y = 0.5 * (a.y + b.y);
      ctx.quadraticCurveTo(a.x, a.y, x, y);
    }
    a = this.nodes[i];
    b = this.nodes[i + 1];
    ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    ctx.stroke();
    ctx.closePath();
  };

  function initLines() {
    lines = [];
    for (let i = 0; i < cfg.trails; i++) {
      lines.push(new Line({ spring: 0.4 + (i / cfg.trails) * 0.025 }));
    }
  }

  // Map pointer position into canvas-local coordinates. The canvas fills its
  // hero container (not the whole viewport), so we offset by its bounding rect.
  function pointer(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    pos.x = src.clientX - rect.left;
    pos.y = src.clientY - rect.top;
  }

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function render() {
    if (!running) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `hsla(${Math.round(hue.update())},90%,55%,${cfg.alpha})`;
    ctx.lineWidth = cfg.lineWidth;
    for (let i = 0; i < cfg.trails; i++) {
      const line = lines[i];
      line.update();
      line.draw();
    }
    rafId = window.requestAnimationFrame(render);
  }

  // Pause when the tab is hidden to save battery/CPU.
  function onVisibility() {
    if (document.hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!running) {
      running = true;
      render();
    }
  }

  resize();
  initLines();
  render();

  window.addEventListener("resize", resize);
  document.addEventListener("mousemove", pointer);
  // `passive` keeps touch scrolling smooth — we never preventDefault, so users
  // can still scroll past the hero on mobile while the trail follows their touch.
  document.addEventListener("touchmove", pointer, { passive: true });
  document.addEventListener("touchstart", pointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  return function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    document.removeEventListener("mousemove", pointer);
    document.removeEventListener("touchmove", pointer);
    document.removeEventListener("touchstart", pointer);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
