(() => {
  const root = document.querySelector('.rcx-home');
  if (!root) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('rcxIndustrialCanvas');
  const meter = document.getElementById('rcxCycleMeter');
  const preloader = document.getElementById('rcxPreloader');
  const preCount = document.getElementById('rcxPreCount');
  const preBar = document.getElementById('rcxPreBar');

  class IndustrialNetwork {
    constructor(el) {
      this.el = el;
      this.ctx = el?.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.progress = 0;
      this.t = 0;
      this.nodes = [
        { x: .14, y: .60, label: 'FIELD I/O' },
        { x: .37, y: .40, label: 'PLC' },
        { x: .62, y: .57, label: 'MOTION' },
        { x: .84, y: .36, label: 'MACHINE' },
      ];
      if (!this.ctx) return;
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      this.loop();
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

    setProgress(v) {
      this.progress = Math.max(0, Math.min(1, v));
    }

    point(node) {
      return { x: node.x * this.w, y: node.y * this.h };
    }

    line(a, b, alpha = .25) {
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

    pulse(a, b, phase, radius = 3) {
      const pa = this.point(a);
      const pb = this.point(b);
      const p = (this.t * .12 + phase + this.progress * .85) % 1;
      const x = pa.x + (pb.x - pa.x) * p;
      const y = pa.y + (pb.y - pa.y) * p;
      const c = this.ctx;
      c.beginPath();
      c.arc(x, y, radius, 0, Math.PI * 2);
      c.fillStyle = 'rgba(89,220,255,.95)';
      c.shadowColor = '#59dcff';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
    }

    drawNode(node, index) {
      const p = this.point(node);
      const c = this.ctx;
      const active = this.progress >= index / (this.nodes.length - 1) - .08;

      c.beginPath();
      c.arc(p.x, p.y, active ? 6 : 4, 0, Math.PI * 2);
      c.fillStyle = active ? 'rgba(117,240,173,.95)' : 'rgba(89,220,255,.7)';
      c.shadowColor = active ? '#75f0ad' : '#59dcff';
      c.shadowBlur = active ? 18 : 10;
      c.fill();
      c.shadowBlur = 0;

      c.beginPath();
      c.arc(p.x, p.y, 18 + index * 2, 0, Math.PI * 2);
      c.strokeStyle = active ? 'rgba(117,240,173,.22)' : 'rgba(89,220,255,.16)';
      c.stroke();

      c.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      c.letterSpacing = '1px';
      c.fillStyle = 'rgba(220,233,244,.55)';
      c.fillText(node.label, p.x + 14, p.y - 14);
    }

    draw() {
      if (!this.ctx) return;
      const c = this.ctx;
      c.clearRect(0, 0, this.w, this.h);

      for (let i = 0; i < this.nodes.length - 1; i++) {
        this.line(this.nodes[i], this.nodes[i + 1], .22 + this.progress * .16);
        this.pulse(this.nodes[i], this.nodes[i + 1], i * .31, i === 1 ? 3.4 : 2.7);
      }

      this.nodes.forEach((node, i) => this.drawNode(node, i));
    }

    loop() {
      if (!this.ctx || reduced) {
        this.draw();
        return;
      }
      this.t += .016;
      this.draw();
      requestAnimationFrame(() => this.loop());
    }
  }

  const network = new IndustrialNetwork(canvas);

  function finishPreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    setTimeout(() => preloader.remove(), 700);
  }

  function initFallbackReveals() {
    const els = document.querySelectorAll('.rcx-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.animate(
          [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
        );
        io.unobserve(entry.target);
      });
    }, { threshold: .12 });
    els.forEach((el) => io.observe(el));
  }

  function initTilt() {
    if (!window.matchMedia('(pointer:fine)').matches || reduced) return;
    document.querySelectorAll('.rcx-project').forEach((card) => {
      const sheen = card.querySelector('.rcx-project__sheen');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5;
        const ny = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `rotateY(${nx * 7}deg) rotateX(${-ny * 7}deg) translateY(-5px)`;
        if (sheen) sheen.style.transform = `translate(${nx * 18}%, ${ny * 18}%)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        if (sheen) sheen.style.transform = '';
      });
    });
  }

  function initGsap() {
    if (!window.gsap || !window.ScrollTrigger || reduced) {
      finishPreloader();
      initFallbackReveals();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const counter = { value: 0 };
    gsap.timeline({ onComplete: finishPreloader })
      .to(counter, {
        value: 100,
        duration: .9,
        ease: 'power2.inOut',
        onUpdate: () => {
          const value = Math.round(counter.value);
          if (preCount) preCount.textContent = String(value).padStart(3, '0');
          if (preBar) preBar.style.width = `${value}%`;
        },
      })
      .to({}, { duration: .12 });

    gsap.from('.rcx-hero__title span', {
      yPercent: 110,
      opacity: 0,
      duration: 1.05,
      stagger: .09,
      ease: 'power4.out',
      delay: 1.02,
    });
    gsap.from('.rcx-kicker, .rcx-hero__subtitle, .rcx-flow, .rcx-hero__actions', {
      y: 28,
      opacity: 0,
      duration: .8,
      stagger: .09,
      ease: 'power3.out',
      delay: 1.25,
    });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 800px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.rcx-hero',
          start: 'top top',
          end: '+=185%',
          pin: true,
          scrub: .6,
          onUpdate: (st) => {
            network.setProgress(st.progress);
            if (meter) meter.textContent = `${String(Math.round(st.progress * 100)).padStart(3, '0')}%`;
          },
        },
      });
      tl.to('.rcx-hero__title', { scale: .92, opacity: .12, ease: 'none' }, 0)
        .to('.rcx-hero__subtitle', { opacity: 0, y: -25, ease: 'none' }, 0)
        .to('.rcx-flow', { y: -20, scale: 1.03, borderColor: 'rgba(89,220,255,.48)', ease: 'none' }, 0)
        .to('.rcx-hero__actions', { opacity: 0, y: 16, ease: 'none' }, .06)
        .to('.rcx-scrollcue', { opacity: 0, ease: 'none' }, 0);
    });

    mm.add('(max-width: 799px)', () => {
      ScrollTrigger.create({
        trigger: '.rcx-hero',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (st) => {
          network.setProgress(st.progress);
          if (meter) meter.textContent = `${String(Math.round(st.progress * 100)).padStart(3, '0')}%`;
        },
      });
    });

    gsap.utils.toArray('.rcx-reveal').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: .85,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        }
      );
    });

    gsap.utils.toArray('.rcx-domain').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 55,
        duration: .8,
        delay: i % 2 ? .08 : 0,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      });
    });

    gsap.from('.rcx-project', {
      opacity: 0,
      y: 70,
      stagger: .12,
      duration: .9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.rcx-work-grid', start: 'top 82%', once: true },
    });
  }

  initTilt();
  initGsap();
})();
