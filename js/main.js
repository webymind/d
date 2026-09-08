gsap.registerPlugin(ScrollTrigger);

document.getElementById('year').textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Hero boot: wait for the hero imagery (and fonts) before the intro ----------
   The zoom-in only reads well if the photo is already decoded, so we gate the
   preloader + intro on decode() with a hard timeout so a slow network never
   leaves the page stuck behind the loader. */
function waitForHeroAssets(timeoutMs = 3000) {
  const imgs = Array.from(document.querySelectorAll('.hero-stage img'));
  const decodes = imgs.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    if (typeof img.decode === 'function') return img.decode().catch(() => {});
    return new Promise(res => { img.onload = img.onerror = res; });
  });
  const fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  const ready = Promise.allSettled([...decodes, fonts]);
  const timeout = new Promise(res => setTimeout(res, timeoutMs));
  return Promise.race([ready, timeout]);
}

let heroBooted = false;
function bootHero() {
  if (heroBooted) return;
  heroBooted = true;
  const pre = document.getElementById('preloader');
  if (pre) {
    gsap.to(pre, { opacity: 0, duration: 0.45, ease: 'power1.out', onComplete: () => pre.remove() });
  }
  playHeroIntro();
}
waitForHeroAssets().then(bootHero);
window.addEventListener('load', () => setTimeout(bootHero, 400)); // belt and braces

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Sticky nav background on scroll ---------- */
const siteNav = document.getElementById('siteNav');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    siteNav.classList.toggle('scrolled', self.scroll() > 80);
  }
});

/* ---------- Hero entrance timeline ----------
   Recreated from the reference motion (2s @ 30fps):
     0.00s  photo + cut-out zoom out from 1.5 → 1
     0.00s  CTA card slides in from the left
     0.17s  TERRAX wordmark drops in from above, BEHIND the excavator
     0.40s  nav pill + logomark drop down, links settle in
   The photo and cut-out layers are tweened together so they never drift. */
const heroZoomLayers = gsap.utils.toArray('.hero-anim-zoom');

function playHeroIntro() {
  if (prefersReducedMotion) {
    gsap.set([heroZoomLayers, '.hero-anim-wordmark', '.hero-anim-card', '.hero-anim-card-item',
      '.hero-anim-navbar', '.hero-anim-logo', '.hero-anim-navitem', '.scroll-cue'], { clearProps: 'all' });
    gsap.set(['.hero-anim-wordmark', '.hero-anim-card', '.hero-anim-navbar', '.hero-anim-logo'], { opacity: 1 });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  window.terraxHeroIntro = tl; // exposed for QA / motion tuning

  tl.fromTo(heroZoomLayers, { scale: 1.5 }, { scale: 1, duration: 1.15, ease: 'power3.out' }, 0)

    .fromTo('.hero-anim-card', { x: -260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85 }, 0.04)
    .fromTo('.hero-anim-card-item', { x: -36, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.18)

    .set('.hero-anim-wordmark', { opacity: 1 }, 0.17)
    .fromTo('.hero-anim-wordmark', { yPercent: -160 }, { yPercent: 0, duration: 0.8, ease: 'power3.out' }, 0.17)

    .fromTo('.hero-anim-navbar', { y: -96, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.42)
    .fromTo('.hero-anim-logo', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0.44)
    .fromTo('.hero-anim-navitem', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.035 }, 0.56)

    .add(startHeroAmbient, 1.2);
}

/* Slow, continuous drift once the intro has settled — keeps the hero alive
   without ever pushing the photo past ~6% (stays sharp on retina). */
function startHeroAmbient() {
  gsap.to(heroZoomLayers, { scale: 1.06, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

/* Scroll parallax: machine drifts down slowly, wordmark rises behind it,
   the CTA card eases away. Scrubbed so it is fully reversible. */
if (!prefersReducedMotion) {
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  })
    .to('.hero-layer--bg, .hero-layer--fg', { yPercent: 12, ease: 'none' }, 0)
    .to('.hero-layer--mark', { yPercent: -18, ease: 'none' }, 0)
    .to('.hero-content', { y: 80, opacity: 0.15, ease: 'none' }, 0);
}

/* ---------- Scroll reveals ---------- */
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    }
  );
});

/* Stagger card groups */
[['.cards-row', '.expertise-card'], ['.services-grid', '.service-card'], ['.why-grid', '.why-card'], ['.stat-row', '.stat']].forEach(([groupSel, itemSel]) => {
  document.querySelectorAll(groupSel).forEach(group => {
    const items = group.querySelectorAll(itemSel);
    gsap.fromTo(items,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 82%' }
      }
    );
  });
});

/* Timeline steps + flow-line draw-in */
document.querySelectorAll('.timeline-row').forEach(row => {
  const steps = row.querySelectorAll('.step');
  gsap.fromTo(steps,
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12,
      scrollTrigger: { trigger: row, start: 'top 85%' }
    }
  );
  row.querySelectorAll('.flow-line line').forEach(line => {
    const len = line.getTotalLength ? line.getTotalLength() : 200;
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(line, {
      strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut', delay: 0.3,
      scrollTrigger: { trigger: row, start: 'top 85%' }
    });
  });
});

/* ---------- Smooth scroll for in-page anchors (offset for fixed nav) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });
});
