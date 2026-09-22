(() => {
  const root = document.querySelector('.rcx-home');
  if (!root) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compact = window.matchMedia('(max-width: 799px)').matches;
  const hero = document.querySelector('.rcx-hero');
  const canvas = document.getElementById('rcxIndustrialCanvas');
  const meter = document.getElementById('rcxCycleMeter');
  const preloader = document.getElementById('rcxPreloader');
  const preCount = document.getElementById('rcxPreCount');
  const preBar = document.getElementById('rcxPreBar');
  const marquee = document.querySelector('.rcx-marquee');

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  class IndustrialNetwork {
    constructor(el) {
      this.el = el;
      this.ctx = el?.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
      this.progress = 0;
      this.t = 0;
      this.active = false;
      this.raf = 0;
      this.lastFrame = 0;
      this.frameInterval = 1000 / (compact ? 24 : 30);
      this.resizeQueued = false;
      this.nodes = [
        { x: .14, y: .60, label: 'FIELD I/O' },
        { x: .37, y: .40, label: 'PLC' },
        { x: .62, y: .57, label: 'MOTION' },
        { x: .84, y: .36, label: 'MACHINE' },
      ];

      if (!this.ctx) return;
      this.resize();
      this.draw();

      window.addEventListener('resize', () => this.queueResize(), { passive: true });

      if ('IntersectionObserver' in window && hero) {
        this.visibilityObserver = new IntersectionObserver(([entry]) => {
          this.setActive(entry.isIntersecting && !document.hidden);
        }, { rootMargin: '120px 0px' });
        this.visibilityObserver.observe(hero);
      } else {
        this.setActive(!reduced);
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.setActive(false);
        else if (hero) {
          const rect = hero.getBoundingClientRect();
          this.setActive(rect.bottom > -120 && rect.top < window.innerHeight + 120);
        }
      });
    }

    queueResize() {
      if (this.resizeQueued) return;
      this.resizeQueued = true;
      requestAnimationFrame(() => {
        this.resizeQueued = false;
        this.resize();
        this.draw();
      });
    }

    resize() {
      if (!this.ctx) return;
      const r = this.el.getBoundingClientRect();
      this.w = Math.max(1, r.width);
      this.h = Math.max(1, r.height);
      this.el.width = Math.floor(this.w * this.dpr);
      this.el.height = Math.floor(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    setActive(active) {
      const next = Boolean(active) && !reduced;
      if (this.active === next) return;
      this.active = next;
      if (this.active && !this.raf) this.raf = requestAnimationFrame((ts) => this.loop(ts));
      if (!this.active && this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    }

    setProgress(value) {
      const next = clamp(value);
      if (Math.abs(next - this.progress) < .003) return;
      this.progress = next;
      if (!this.active) this.draw();
    }

    point(node) {
      return { x: node.x * this.w, y: node.y * this.h };
    }

    line(a, b, alpha = .2) {
      const pa = this.point(a);
      const pb = this.point(b);
      const c = this.ctx;
      c.beginPath();
      c.moveTo(pa.x, pa.y);
      c.lineTo(pb.x, pb.y);
      c.strokeStyle = `rgba(89,220,255,${alpha})`;
      c.lineWidth = 1;
      c.stroke();
    }

    pulse(a, b, phase, radius = 2.5) {
      const pa = this.point(a);
      const pb = this.point(b);
      const p = (this.t * .09 + phase + this.progress * .8) % 1;
      const x = pa.x + (pb.x - pa.x) * p;
      const y = pa.y + (pb.y - pa.y) * p;
      const c = this.ctx;
      c.beginPath();
      c.arc(x, y, radius, 0, Math.PI * 2);
      c.fillStyle = 'rgba(89,220,255,.86)';
      c.shadowColor = '#59dcff';
      c.shadowBlur = 6;
      c.fill();
      c.shadowBlur = 0;
    }

    drawNode(node, index) {
      const p = this.point(node);
      const c = this.ctx;
      const active = this.progress >= index / (this.nodes.length - 1) - .08;

      c.beginPath();
      c.arc(p.x, p.y, active ? 5 : 3.5, 0, Math.PI * 2);
      c.fillStyle = active ? 'rgba(117,240,173,.9)' : 'rgba(89,220,255,.62)';
      c.shadowColor = active ? '#75f0ad' : '#59dcff';
      c.shadowBlur = active ? 8 : 5;
      c.fill();
      c.shadowBlur = 0;

      c.beginPath();
      c.arc(p.x, p.y, 16 + index * 2, 0, Math.PI * 2);
      c.strokeStyle = active ? 'rgba(117,240,173,.16)' : 'rgba(89,220,255,.12)';
      c.stroke();

      c.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      c.fillStyle = 'rgba(220,233,244,.48)';
      c.fillText(node.label, p.x + 13, p.y - 13);
    }

    draw() {
      if (!this.ctx) return;
      const c = this.ctx;
      c.clearRect(0, 0, this.w, this.h);

      for (let i = 0; i < this.nodes.length - 1; i += 1) {
        this.line(this.nodes[i], this.nodes[i + 1], .17 + this.progress * .1);
        this.pulse(this.nodes[i], this.nodes[i + 1], i * .31, i === 1 ? 2.8 : 2.3);
      }

      this.nodes.forEach((node, i) => this.drawNode(node, i));
    }

    loop(timestamp) {
      this.raf = 0;
      if (!this.active || !this.ctx) return;

      if (timestamp - this.lastFrame >= this.frameInterval) {
        this.lastFrame = timestamp;
        this.t += this.frameInterval / 1000;
        this.draw();
      }

      this.raf = requestAnimationFrame((ts) => this.loop(ts));
    }
  }

  const network = new IndustrialNetwork(canvas);

  function finishPreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    window.setTimeout(() => preloader.remove(), 320);
  }

  function initPreloader() {
    if (!preloader) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem('rcxIntroSeen') === '1';
    } catch (_) {
      seen = false;
    }

    if (seen || reduced) {
      preloader.remove();
      return;
    }

    const duration = 420;
    const start = performance.now();

    const tick = (now) => {
      const progress = clamp((now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * 100);
      if (preCount) preCount.textContent = String(value).padStart(3, '0');
      if (preBar) preBar.style.width = `${value}%`;

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      try { sessionStorage.setItem('rcxIntroSeen', '1'); } catch (_) {}
      finishPreloader();
    };

    requestAnimationFrame(tick);
  }

  function initReveals() {
    const elements = document.querySelectorAll('.rcx-reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });

    elements.forEach((el) => observer.observe(el));
  }

  function initHeroProgress() {
    if (!hero) return;
    let queued = false;

    const update = () => {
      queued = false;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(1, rect.height * .78);
      const progress = clamp(-rect.top / travel);

      root.style.setProperty('--rcx-title-y', `${(-10 * progress).toFixed(2)}px`);
      root.style.setProperty('--rcx-title-scale', (1 - progress * .025).toFixed(4));
      root.style.setProperty('--rcx-title-opacity', (1 - progress * .38).toFixed(3));
      root.style.setProperty('--rcx-detail-y', `${(-8 * progress).toFixed(2)}px`);
      root.style.setProperty('--rcx-detail-opacity', (1 - progress * .45).toFixed(3));

      network.setProgress(progress);
      if (meter) meter.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
    };

    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    update();
  }

  function initMarqueePause() {
    if (!marquee || reduced || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      marquee.classList.toggle('is-paused', !entry.isIntersecting || document.hidden);
    }, { rootMargin: '80px 0px' });
    observer.observe(marquee);
  }

  initPreloader();
  initReveals();
  initHeroProgress();
  initMarqueePause();
})();
