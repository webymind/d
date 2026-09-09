/* ============================================================
   TERRAX HOLDINGS — site behaviour
   GSAP + ScrollTrigger are vendored locally in js/vendor/.
   ============================================================ */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* ==========================================================
     HERO INTRO
     Recreated from the reference motion (2.03s @ 30fps):
       0.00s  photo + cut-out zoom out from 1.5 → 1
       0.04s  CTA card slides in from the left
       0.18s  TERRAX wordmark drops in from above, BEHIND the boom
       0.55s  logomark + nav capsule drop down, links settle
       1.15s  scroll cue fades up, ambient drift begins
     The photo and cut-out layers are tweened as one set so they
     never drift apart.
     ========================================================== */
  var zoomLayers = $$('.hero-anim-zoom');
  var introPlayed = false;

  function playHeroIntro() {
    if (introPlayed) return;
    introPlayed = true;

    if (reduced) {
      gsap.set(zoomLayers, { clearProps: 'transform' });
      gsap.set(['.hero-anim-wordmark', '.hero-anim-card', '.hero-anim-navbar', '.hero-anim-logo', '.hero-scrollcue'], { opacity: 1 });
      return;
    }

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    window.terraxHeroIntro = tl; // exposed for motion tuning in devtools

    tl.fromTo(zoomLayers, { scale: 1.5 }, { scale: 1, duration: 1.25, ease: 'power3.out' }, 0)

      .fromTo('.hero-anim-card', { x: -260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 }, 0.04)
      .fromTo('.hero-anim-card-item', { x: -34, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.09 }, 0.2)

      /* The wordmark drops from above and is overlapped by the machine,
         because the cut-out layer sits above it in the stack. */
      .set('.hero-anim-wordmark', { opacity: 1 }, 0.18)
      .fromTo('.hero-anim-wordmark', { yPercent: -165 }, { yPercent: 0, duration: 0.95, ease: 'power3.out' }, 0.18)

      .fromTo('.hero-anim-navbar', { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.55)
      .fromTo('.hero-anim-logo', { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.3)' }, 0.58)
      .fromTo('.hero-anim-navitem', { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.035 }, 0.7)

      .to('.hero-scrollcue', { opacity: 1, duration: 0.6 }, 1.15)
      .add(startAmbientDrift, 1.25);
  }

  /* Slow ambient drift after the intro settles. Capped at 6% so the
     photo never softens on a retina display. */
  function startAmbientDrift() {
    gsap.to(zoomLayers, { scale: 1.06, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* Wait for the hero imagery to decode before playing, with a hard
     timeout so a slow network never leaves the page frozen. */
  function whenHeroReady(timeoutMs) {
    var imgs = $$('.hero-stage img');
    var jobs = imgs.map(function (img) {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      if (typeof img.decode === 'function') return img.decode().catch(function () {});
      return new Promise(function (res) { img.onload = img.onerror = res; });
    });
    if (document.fonts && document.fonts.ready) jobs.push(document.fonts.ready.catch(function () {}));
    return Promise.race([
      Promise.all(jobs.map(function (p) { return p.catch(function () {}); })),
      new Promise(function (res) { setTimeout(res, timeoutMs || 2600); })
    ]);
  }
  whenHeroReady().then(playHeroIntro);
  window.addEventListener('load', function () { setTimeout(playHeroIntro, 300); });

  /* Hero parallax: machine drifts down, wordmark rises behind it. */
  if (!reduced) {
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-layer--bg, .hero-layer--fg', { yPercent: 6, ease: 'none' }, 0)
      .to('.hero-layer--mark', { yPercent: -14, opacity: 0.1, ease: 'none' }, 0)
      .to('.hero-content', { y: 70, opacity: 0.1, ease: 'none' }, 0)
      .to('.hero-scrollcue', { opacity: 0, ease: 'none' }, 0);
  }

  /* ==========================================================
     HEADER — transparent over the hero, solid once past it
     ========================================================== */
  var nav = $('#siteNav');
  ScrollTrigger.create({
    start: 'top -40',
    onUpdate: function (self) {
      var solid = self.scroll() > 40;
      nav.classList.toggle('is-solid', solid);
      nav.style.background = solid ? 'rgba(248,247,244,.9)' : 'rgba(248,247,244,0)';
      nav.style.backdropFilter = nav.style.webkitBackdropFilter = solid ? 'blur(16px)' : 'none';
      nav.style.boxShadow = solid ? '0 1px 0 rgba(17,17,17,.07)' : 'none';
    }
  });

  /* ==========================================================
     MOBILE MENU
     ========================================================== */
  var sheet = $('#menuSheet');
  function openMenu() {
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#navToggle').setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    $('#navToggle').setAttribute('aria-expanded', 'false');
  }
  $('#navToggle').addEventListener('click', openMenu);
  $('#tabbarMenu').addEventListener('click', openMenu);
  $('#menuClose').addEventListener('click', closeMenu);
  $$('.menu-sheet a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeMenu(); });

  /* ==========================================================
     02 · WHAT WE DO — sticky section, scroll-scrubbed
     Section height is 8 viewport-lengths of scroll; progress through
     it drives (a) which service panel is shown, (b) the segment bar,
     and (c) the video's currentTime when a video is present.
     ========================================================== */
  var wwd = $('.wwd');
  if (wwd) {
    var panels = $$('[data-wwd-panel]', wwd);
    var segs   = $$('[data-wwd-seg]', wwd);
    var nums   = $$('[data-wwd-num]', wwd);
    var video  = $('#wwdVideo');
    var count  = panels.length;

    /* Only show the <video> when a real file is present; otherwise the
       striped placeholder stays. */
    (function initVideo() {
      if (!video) return;
      var src = video.getAttribute('data-src');
      if (!src) return;
      fetch(src, { method: 'HEAD' }).then(function (r) {
        if (!r.ok) return;
        video.src = src;
        video.hidden = false;
        var ph = $('#wwdPlaceholder');
        if (ph) ph.hidden = true;
      }).catch(function () { /* no video yet — keep the placeholder */ });
    })();

    function renderWwd(p) {
      var pos = p * count;
      var active = Math.max(0, Math.min(count - 1, Math.floor(pos)));

      panels.forEach(function (el, i) {
        var d = pos - i, o = 0, ty = 26;
        if (d >= 0 && d < 1) {
          o = i === 0 ? Math.min(1, (1 - d) / 0.16) : Math.min(1, d / 0.16, (1 - d) / 0.16);
          o = Math.max(0, o);
          ty = (1 - o) * 22 - (d > 0.5 ? d * 6 : 0);
        }
        el.style.opacity = o.toFixed(3);
        el.style.transform = 'translateY(' + ty.toFixed(1) + 'px)';
        el.style.pointerEvents = o > 0.55 ? 'auto' : 'none';
      });

      segs.forEach(function (el, i) {
        el.style.width = (Math.max(0, Math.min(1, pos - i)) * 100).toFixed(1) + '%';
      });
      nums.forEach(function (el, i) { el.style.color = i === active ? '#FFFFFF' : '#D5D4D0'; });

      if (video && !video.hidden && video.duration && isFinite(video.duration)) {
        var t = p * (video.duration - 0.05);
        if (Math.abs(video.currentTime - t) > 0.04) { try { video.currentTime = t; } catch (e) {} }
      }
    }

    ScrollTrigger.create({
      trigger: wwd,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) { renderWwd(self.progress); },
      onRefresh: function (self) { renderWwd(self.progress); }
    });
    renderWwd(0);

    $$('[data-wwd-jump]', wwd).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.getAttribute('data-wwd-jump');
        var span = Math.max(1, wwd.offsetHeight - window.innerHeight);
        var top = wwd.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.round(top + span * ((i + 0.5) / count)), behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ==========================================================
     03 · HOW WE WORK — eight-stage selector
     ========================================================== */
  var STAGES = [
    ['Client Consultation', 'Understand objectives, requirements, budget and expectations.'],
    ['Site Assessment', 'Assess site conditions, accessibility and project requirements.'],
    ['Design & Planning', 'Develop the scope, methodology, programme and resource requirements.'],
    ['Quotation & Contract', 'Agree a clear scope, quotation and contractual basis.'],
    ['Procurement', 'Coordinate materials, equipment and resources.'],
    ['Project Execution', 'Coordinate and execute works with focus on quality, safety and programme.'],
    ['Quality Inspection', 'Inspect workmanship and materials and address snags.'],
    ['Handover & Support', 'Complete final inspection, handover and after-sales support where applicable.']
  ];
  var stageIndex = 0;
  var stageTabs = $$('.stage-tab');
  var stageRows = $$('.stage-row');

  function setStage(i) {
    stageIndex = (i + STAGES.length) % STAGES.length;
    var pad = String(stageIndex + 1).padStart(2, '0');
    $('#stageNum').textContent = pad;
    $('#stageName').textContent = STAGES[stageIndex][0];
    $('#stageDesc').textContent = STAGES[stageIndex][1];
    $('#stageProgress').style.width = ((stageIndex + 1) / STAGES.length * 100).toFixed(1) + '%';
    $('#stageNext').firstChild.nodeValue = stageIndex === STAGES.length - 1 ? 'Back to stage 01 ' : 'Next stage ';
    stageTabs.forEach(function (t, n) {
      t.classList.toggle('is-active', n === stageIndex);
      t.classList.toggle('is-past', n < stageIndex);
      t.setAttribute('aria-selected', String(n === stageIndex));
    });
    stageRows.forEach(function (r, n) { r.classList.toggle('is-active', n === stageIndex); });
  }
  stageTabs.concat(stageRows).forEach(function (el) {
    el.addEventListener('click', function () { setStage(+el.getAttribute('data-stage')); });
  });
  $('#stageNext').addEventListener('click', function () { setStage(stageIndex + 1); });
  $('#stagePrev').addEventListener('click', function () { setStage(stageIndex - 1); });
  setStage(0);

  /* ==========================================================
     06 · QUALITY & SAFETY — tab switch
     ========================================================== */
  $$('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-tab');
      $$('.tab').forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      $$('.qs-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key; });
    });
  });

  /* ==========================================================
     Scroll reveals — elements rest visible, then animate in
     ========================================================== */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el, i) {
      var siblings = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(siblings, 5) * 65 + 'ms';
      io.observe(el);
    });
    /* Failsafe: never leave content hidden if the observer misfires. */
    setTimeout(function () { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }, 4000);
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ==========================================================
     Anchor scrolling with a fixed-header offset + active tab state
     ========================================================== */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - (id === '#home' ? 0 : 74);
      window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  var tabbarItems = $$('.tabbar-item[href]');
  ScrollTrigger.create({
    start: 'top top', end: 'max',
    onUpdate: function () {
      var y = window.scrollY + 120, current = '#home';
      ['#home', '#services', '#projects', '#contact'].forEach(function (id) {
        var el = $(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= y) current = id;
      });
      tabbarItems.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('href') === current); });
    }
  });
})();
