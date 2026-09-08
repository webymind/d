gsap.registerPlugin(ScrollTrigger);

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Preloader ---------- */
window.addEventListener('load', () => {
  gsap.to('#preloader', {
    opacity: 0,
    duration: 0.5,
    delay: 0.2,
    onComplete: () => document.getElementById('preloader').remove()
  });
  playHeroIntro();
});

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

/* ---------- Sticky nav background on scroll ---------- */
const siteNav = document.getElementById('siteNav');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    siteNav.classList.toggle('scrolled', self.scroll() > 80);
  }
});

/* ---------- Hero entrance timeline ---------- */
/* Timings mirror the Figma keyframe data captured on the hero frame:
   background scale-in, header slide-down, nav-item + copy slide-in from left,
   logomark drop with a slight settle. Recreated as a single 2s entrance. */
function playHeroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.fromTo('.hero-anim-bg', { scale: 1.5 }, { scale: 1, duration: 1.25, ease: 'power2.inOut' }, 0)
    .fromTo('.hero-anim-logo', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.6)' }, 0.05)
    .fromTo('.hero-anim-navbar', { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0)
    .fromTo('.hero-anim-navitem', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.05 }, 0.15)
    .fromTo('.hero-anim-title', { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.1)
    .fromTo('.hero-anim-card', { x: -200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 0.15)
    .fromTo('.hero-anim-card-item', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.3)
    .fromTo('.scroll-cue', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2);
}

/* Fallback in case 'load' already fired before script executed */
if (document.readyState === 'complete') {
  playHeroIntro();
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
