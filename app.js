/* =============================================
   FAM WHEEL – app.js
   Animations, Interactions & Dynamic Behaviour
   ============================================= */

'use strict';

// ─── PRELOADER ──────────────────────────────────
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 2400);
});
document.body.style.overflow = 'hidden';

// ─── PARTICLES ──────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 8 + 3;
    p.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${8 + Math.random() * 14}s;
      animation-delay:${Math.random() * -20}s;
      opacity:${0.1 + Math.random() * 0.3};
    `;
    container.appendChild(p);
  }
}
initParticles();

// ─── NAVBAR SCROLL ──────────────────────────────
const navbar = document.getElementById('navbar');
function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ─── HAMBURGER / MOBILE NAV ─────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose= document.getElementById('mobileClose');
const mnavLinks  = document.querySelectorAll('.mnav-link');

hamburger?.addEventListener('click', () => {
  mobileNav?.classList.add('open');
  document.body.style.overflow = 'hidden';
});

mobileClose?.addEventListener('click', closeMobileNav);

mnavLinks.forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

function closeMobileNav() {
  mobileNav?.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── SCROLL TO TOP ──────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (!scrollTopBtn) return;
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── COUNTER ANIMATION ──────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('en-IN');
  }
  requestAnimationFrame(update);
}

// ─── LIGHTWEIGHT AOS (Animate On Scroll) ────────
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || 0, 10);
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);

        // Trigger counters when hero is visible
        if (entry.target.closest('#hero')) {
          document.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
}
initAOS();

// Trigger counters if hero is immediately visible
const heroEl = document.getElementById('hero');
if (heroEl) {
  const heroObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        document.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
      }, 2600);
      heroObs.disconnect();
    }
  }, { threshold: 0.3 });
  heroObs.observe(heroEl);
}

// ─── PRICE BARS ANIMATION ────────────────────────
function animatePriceBars() {
  const fills = document.querySelectorAll('.price-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Width already set via inline style — just re-trigger
        const el = entry.target;
        const w = el.style.width;
        el.style.width = '0%';
        setTimeout(() => { el.style.width = w; }, 100);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => observer.observe(f));
}
animatePriceBars();

// ─── ROLES TABS ──────────────────────────────────
const tabBtns    = document.querySelectorAll('.tab-btn');
const tabContents= document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const target = document.getElementById(`tab-${tab}`);
    if (target) {
      target.classList.add('active');
      // Trigger role emoji animation
      const emoji = target.querySelector('.role-emoji-big');
      if (emoji) {
        emoji.style.transform = 'scale(0.7)';
        setTimeout(() => { emoji.style.transform = ''; }, 50);
      }
    }
  });
});

// ─── TESTIMONIALS SLIDER ─────────────────────────
function initTestimonialsSlider() {
  const track    = document.getElementById('testimonialTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  let currentIndex = 0;
  let visibleCount = getVisibleCount();
  const totalSlides = Math.ceil(cards.length / visibleCount);

  // Create dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const slides = Math.ceil(cards.length / getVisibleCount());
    for (let i = 0; i < slides; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function getVisibleCount() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function goTo(idx) {
    const vc   = getVisibleCount();
    const maxIdx = Math.ceil(cards.length / vc) - 1;
    currentIndex = Math.max(0, Math.min(idx, maxIdx));
    const cardWidth = cards[0].offsetWidth + 28; // gap = 28px
    track.style.transform = `translateX(-${currentIndex * vc * cardWidth}px)`;
    updateDots();
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Auto-play
  let autoPlay = setInterval(() => goTo(currentIndex + 1 > Math.ceil(cards.length / getVisibleCount()) - 1 ? 0 : currentIndex + 1), 5000);

  track.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goTo(currentIndex + 1 > Math.ceil(cards.length / getVisibleCount()) - 1 ? 0 : currentIndex + 1), 5000);
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });

  buildDots();
}
initTestimonialsSlider();

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── ACTIVE NAV LINK HIGHLIGHT ───────────────────
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  function update() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        links.forEach(l => l.classList.remove('nav-active'));
        const active = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if (active) active.classList.add('nav-active');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
}
initActiveNavHighlight();

// ─── FEATURE CARD TILT EFFECT ────────────────────
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const rotX  = ((e.clientY - cy) / rect.height) * -8;
    const rotY  = ((e.clientX - cx) / rect.width)  *  8;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── MARKET CARD LIVE PRICE BLINK ────────────────
function startLivePriceBlink() {
  const priceEls = document.querySelectorAll('.market-price');
  setInterval(() => {
    priceEls.forEach(el => {
      el.style.transition = 'color 0.2s';
      el.style.color = '#22c55e';
      setTimeout(() => { el.style.color = ''; }, 400);
    });
  }, 4000);
}
startLivePriceBlink();

// ─── TYPED HERO SUBTITLE EFFECT ──────────────────
function initTypeEffect() {
  const el = document.querySelector('.hero-subtitle');
  if (!el) return;
  const original = el.textContent.trim();
  const phrases = [
    'FAM WHEEL bridges the gap between farmers, buyers, and transport providers.',
    'Transparent pricing, no middlemen — just direct farm-to-market trading.',
    'Join 10,000+ farmers already selling smarter with FAM WHEEL.',
  ];
  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  // Only start after preloader
  setTimeout(() => {
    el.textContent = '';
    function tick() {
      if (paused) return;
      const current = phrases[phraseIdx];

      if (!deleting) {
        charIdx++;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 2800);
          return;
        }
        setTimeout(tick, 34);
      } else {
        charIdx--;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 18);
      }
    }
    tick();

    // Stop typing animation if user scrolls away from hero
    const heroObs2 = new IntersectionObserver(entries => {
      paused = !entries[0].isIntersecting;
      if (!paused) tick();
    }, { threshold: 0.3 });
    const hero = document.getElementById('hero');
    if (hero) heroObs2.observe(hero);
  }, 2600);
}
initTypeEffect();

// ─── REGISTER PAGE ROLE SELECTION ────────────────
function initRoleSelect() {
  const roleItems = document.querySelectorAll('.role-select-item');
  if (!roleItems.length) return;

  // Pre-select from URL param
  const params = new URLSearchParams(window.location.search);
  const preRole = params.get('role');
  if (preRole) {
    roleItems.forEach(item => {
      if (item.dataset.role === preRole) item.classList.add('selected');
    });
  }

  roleItems.forEach(item => {
    item.addEventListener('click', () => {
      roleItems.forEach(r => r.classList.remove('selected'));
      item.classList.add('selected');
      const hiddenInput = document.getElementById('roleInput');
      if (hiddenInput) hiddenInput.value = item.dataset.role;
    });
  });
}
initRoleSelect();

// ─── DASHBOARD CHART ─────────────────────────────
function initDashChart() {
  const bars = document.querySelectorAll('.chart-bar');
  if (!bars.length) return;
  const values = [40, 65, 50, 80, 60, 90, 75]; // % heights
  bars.forEach((bar, i) => {
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.height = `${values[i]}%`;
    }, 300 + i * 80);
  });
}

// Run chart init if on dashboard page
if (document.querySelector('.dashboard-layout')) {
  initDashChart();
}

// ─── FORM VALIDATION ─────────────────────────────
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', e => {
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ef4444';
          field.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.12)';
        } else {
          field.style.borderColor = '';
          field.style.boxShadow   = '';
        }
      });
      if (!valid) {
        e.preventDefault();
        const firstErr = form.querySelector('[required]:invalid, [required][value=""]');
        firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}
initFormValidation();

// ─── TICKER PAUSE ON HOVER ───────────────────────
const ticker = document.querySelector('.ticker');
if (ticker) {
  ticker.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  ticker.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
}

console.log('%c🚜 FAM WHEEL', 'font-size:20px;font-weight:800;color:#22c55e');
console.log('%cFrom Farm to Market, Without the Hassle.', 'color:#6b7280;font-size:12px');
