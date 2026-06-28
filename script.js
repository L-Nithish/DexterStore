/*
  DexterStore — script.js
  Author: Dexter
  Backend: Spring Boot REST API → https://dexterstore-backend.onrender.com
  Frontend: Pure HTML/CSS/JS
*/

'use strict';

const API_BASE = 'https://dexterstore-backend.onrender.com/api/products';
let PRODUCTS = [];

const FALLBACK_PRODUCTS = [
  {
    id: 1, category: 'resume', categoryLabel: 'Resume Template',
    name: 'Executive Pro Resume',
    desc: 'ATS-optimised, single-page resume for senior roles. Crisp typography, zero clutter.',
    price: 14, oldPrice: 22, rating: 4.9, reviews: 312,
    badge: 'Bestseller', badgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2, category: 'resume', categoryLabel: 'Resume Template',
    name: 'Creative Portfolio Resume',
    desc: 'For designers and front-end developers who want their CV to genuinely stand out.',
    price: 12, oldPrice: null, rating: 4.8, reviews: 187,
    badge: null, badgeColor: '',
    image: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3, category: 'ui', categoryLabel: 'UI Kit',
    name: 'SaaS Dashboard UI Kit',
    desc: '80+ components — tables, charts, modals, forms. Dark & light modes. Figma included.',
    price: 39, oldPrice: 59, rating: 4.9, reviews: 421,
    badge: 'Popular', badgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4, category: 'ui', categoryLabel: 'UI Kit',
    name: 'Mobile App Component Kit',
    desc: 'iOS and Android-ready UI components for React Native and Flutter projects.',
    price: 29, oldPrice: null, rating: 4.7, reviews: 98,
    badge: 'New', badgeColor: '',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 5, category: 'notes', categoryLabel: 'Coding Notes',
    name: 'DSA Interview Cheatsheet',
    desc: 'Arrays, trees, graphs, DP, sorting — formatted for quick revision before interviews.',
    price: 9, oldPrice: null, rating: 4.9, reviews: 560,
    badge: 'Bestseller', badgeColor: 'green',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 6, category: 'notes', categoryLabel: 'Coding Notes',
    name: 'System Design Notes',
    desc: 'Load balancing, caching, databases, microservices — everything for design rounds.',
    price: 11, oldPrice: null, rating: 4.8, reviews: 233,
    badge: null, badgeColor: '',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 7, category: 'ui', categoryLabel: 'UI Kit',
    name: 'Landing Page UI Kit',
    desc: 'Hero sections, pricing tables, testimonials, footers — 40+ Figma components.',
    price: 24, oldPrice: 35, rating: 4.7, reviews: 155,
    badge: null, badgeColor: '',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 8, category: 'resume', categoryLabel: 'Resume Template',
    name: 'Minimalist Resume Pack',
    desc: 'Three clean templates in one — for engineers, analysts, and product managers.',
    price: 18, oldPrice: null, rating: 4.8, reviews: 204,
    badge: null, badgeColor: '',
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 9, category: 'bundle', categoryLabel: 'Bundle',
    name: 'Complete Creator Bundle',
    desc: 'Every resume, UI kit, and notes pack — bundled at 30% off individual prices.',
    price: 79, oldPrice: 120, rating: 5.0, reviews: 88,
    badge: 'Best Value', badgeColor: 'green',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
  },
];

function normaliseProduct(p) {
  return {
    id:            p.id,
    name:          p.name  || p.title || 'Untitled Product',
    price:         Number(p.price) || 0,
    image:         p.image || p.img || '',
    oldPrice:      p.oldPrice      || null,
    rating:        p.rating        || 4.5,
    reviews:       p.reviews       || 0,
    badge:         p.badge         || null,
    badgeColor:    p.badgeColor    || '',
    category:      p.category      || 'general',
    categoryLabel: p.categoryLabel || 'Product',
    desc:          p.desc          || p.description || '',
  };
}

async function loadProductsFromBackend() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    PRODUCTS = data.map(normaliseProduct);
  } catch (error) {
    console.error(error);
  }

  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === '' || page === 'index.html') renderHomeGrid();
  if (page === 'products.html') initProductsPage();
}

const Cart = {
  KEY: 'dexterstore_cart',
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },
  save(arr)  { localStorage.setItem(this.KEY, JSON.stringify(arr)); },
  count()    { return this.get().length; },
  subtotal() { return this.get().reduce((s, i) => s + i.price, 0); },
  add(p) {
    const arr = this.get();
    if (arr.find(i => i.id === p.id)) return false;
    arr.push({
      id:            p.id,
      title:         p.name,
      price:         p.price,
      img:           p.image,
      categoryLabel: p.categoryLabel,
    });
    this.save(arr);
    return true;
  },
  remove(id) { this.save(this.get().filter(i => i.id !== id)); },
};

function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type ? ' toast--' + type : '') + ' show';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}
window.showToast = showToast;

function syncCartBadge() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = Cart.count();
}

function buildCard(p) {
  const safeRating = Math.min(5, Math.max(0, Math.round(p.rating)));
  const stars      = '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  const badge      = p.badge
    ? `<span class="pc-badge pc-badge--${p.badgeColor}">${p.badge}</span>`
    : '';
  const oldPx = p.oldPrice
    ? `<span class="pc-price-old">$${p.oldPrice}</span>`
    : '';
  const imgSrc = p.image || 'https://placehold.co/600x375?text=No+Image';

  return `
<div class="product-card reveal" data-id="${p.id}">
  <div class="pc-thumb">
    <a href="product.html?id=${p.id}">
      <img src="${imgSrc}" alt="${p.name}" loading="lazy"
           onerror="this.src='https://placehold.co/600x375?text=No+Image'">
    </a>
    ${badge}
    <div class="pc-overlay">
      <a href="product.html?id=${p.id}" class="btn btn-white btn-sm">View details</a>
      <button class="btn btn-white btn-sm"
              onclick="addToCart(${p.id}, this)">Quick add</button>
    </div>
  </div>
  <div class="pc-body">
    <div class="pc-meta">
      <span class="pc-cat">${p.categoryLabel}</span>
      <span class="pc-rating">
        <span class="pc-stars">${stars}</span>&nbsp;${p.rating} (${p.reviews})
      </span>
    </div>
    <h3 class="pc-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
    <p class="pc-desc">${p.desc}</p>
    <div class="pc-footer">
      <div class="pc-price">
        <span class="pc-price-main">$${p.price}</span>
        ${oldPx}
      </div>
      <button class="btn btn-primary btn-sm"
              onclick="addToCart(${p.id}, this)">Add to cart</button>
    </div>
  </div>
</div>`;
}

window.addToCart = function(id, btn) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) {
    showToast('Product not found.', 'error');
    return;
  }
  if (Cart.add(p)) {
    showToast('"' + p.name + '" added to cart ✓', 'success');
    syncCartBadge();
    btn.textContent  = 'Added ✓';
    btn.disabled     = true;
    btn.style.cssText = 'background:#10b981;border-color:#10b981;opacity:1;';
  } else {
    showToast('Already in your cart.', '');
  }
};

function renderHomeGrid() {
  const grid = document.getElementById('homeProductGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.slice(0, 6).map(buildCard).join('');
  initReveal();
}

let activeFilter = 'all';
let activeSort   = 'popular';

function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  let list = [...PRODUCTS];

  if (activeFilter !== 'all') {
    list = list.filter(p => p.category === activeFilter);
  }

  if (activeSort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (activeSort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (activeSort === 'newest')     list.sort((a, b) => b.id - a.id);

  grid.innerHTML = list.length
    ? list.map(buildCard).join('')
    : '<p style="color:var(--ink-400);padding:24px 0;">No products found.</p>';

  initReveal();
}

function initProductsPage() {
  const tabsEl = document.getElementById('filterTabs');
  const sortEl = document.getElementById('sortSelect');

  if (tabsEl) {
    const freshTabs = tabsEl.cloneNode(true);
    tabsEl.parentNode.replaceChild(freshTabs, tabsEl);

    freshTabs.addEventListener('click', e => {
      const tab = e.target.closest('.ftab');
      if (!tab) return;
      freshTabs.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderProductGrid();
    });
  }

  if (sortEl) {
    sortEl.addEventListener('change', () => {
      activeSort = sortEl.value;
      renderProductGrid();
    });
  }

  renderProductGrid();
}

const COUPONS = { DEXTER20: 0.20, LAUNCH10: 0.10, SAVE15: 0.15 };
let discountRate = 0;

function renderCartItems() {
  const wrap  = document.getElementById('cartItemsWrap');
  const badge = document.getElementById('cartItemCount');
  if (!wrap) return;

  const items = Cart.get();
  if (badge) badge.textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');

  if (!items.length) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-title">Nothing here yet</div>
        <div class="cart-empty-sub">Go pick something from the store.</div>
        <a href="products.html" class="btn btn-primary" style="margin-top:16px;">Browse products</a>
      </div>`;
    updateSummary();
    return;
  }

  wrap.innerHTML = items.map(it => `
    <div class="cart-item" id="ci-${it.id}">
      <img class="cart-item-img" src="${it.img || ''}" alt="${it.title}"
           onerror="this.src='https://placehold.co/80x60?text=?'">
      <div class="cart-item-info">
        <div class="cart-item-cat">${it.categoryLabel || 'Product'}</div>
        <div class="cart-item-name">${it.title}</div>
        <div class="cart-item-meta">Digital download · Instant access</div>
      </div>
      <span class="cart-item-price">$${it.price}</span>
      <button class="cart-item-rm" onclick="removeItem(${it.id})" title="Remove">✕</button>
    </div>`).join('');

  updateSummary();
}

window.removeItem = function(id) {
  const el = document.getElementById('ci-' + id);
  if (el) {
    el.style.transition = 'opacity .2s, transform .2s';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(14px)';
    setTimeout(() => {
      Cart.remove(id);
      syncCartBadge();
      renderCartItems();
    }, 220);
  }
};

function updateSummary() {
  const sub      = Cart.subtotal();
  const discount = parseFloat((sub * discountRate).toFixed(2));
  const tax      = parseFloat(((sub - discount) * 0.18).toFixed(2));
  const total    = parseFloat((sub - discount + tax).toFixed(2));
  const fmt      = n => '$' + n.toFixed(2);
  const byId     = id => document.getElementById(id);

  if (byId('sumSubtotal')) byId('sumSubtotal').textContent = fmt(sub);
  if (byId('sumDiscount')) byId('sumDiscount').textContent = discount > 0 ? '-' + fmt(discount) : '—';
  if (byId('sumTax'))      byId('sumTax').textContent      = fmt(tax);
  if (byId('sumTotal'))    byId('sumTotal').textContent    = fmt(total);
}

function initCartPage() {
  renderCartItems();

  const applyBtn  = document.getElementById('applyCoupon');
  const couponIn  = document.getElementById('couponInput');
  const couponMsg = document.getElementById('couponMsg');
  const checkBtn  = document.getElementById('checkoutBtn');

  if (applyBtn && couponIn && couponMsg) {
    function applyCoupon() {
      const code = couponIn.value.trim().toUpperCase();
      if (COUPONS[code]) {
        discountRate          = COUPONS[code];
        couponMsg.textContent = '✓ ' + (COUPONS[code] * 100) + '% discount applied!';
        couponMsg.style.color = '#10b981';
        updateSummary();
      } else {
        couponMsg.textContent = 'Invalid code. Try DEXTER20, LAUNCH10 or SAVE15.';
        couponMsg.style.color = '#ef4444';
      }
    }
    applyBtn.addEventListener('click', applyCoupon);
    couponIn.addEventListener('keydown', e => { if (e.key === 'Enter') applyCoupon(); });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      if (!Cart.count()) { showToast('Your cart is empty!', 'error'); return; }
      showToast('Redirecting to checkout…', 'success');
    });
  }
}

function initNavbar() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }
}

function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  if (!window.IntersectionObserver) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => io.observe(el));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

function initTheme() {
  const saved = localStorage.getItem('dexterstore_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dexterstore_theme', next);
    });
  }
}

function initCountUp() {
  const counters = document.querySelectorAll('[data-countup]');
  if (!counters.length) return;

  const observed = new Set();

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.countup);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const format   = el.dataset.format;
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = Math.min((now - start) / duration, 1);
      const eased    = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      const current  = eased * target;

      if (format === 'k') {
        el.textContent = (current / 1000).toFixed(current >= target ? 0 : 1) + 'k';
      } else {
        el.textContent = current.toFixed(decimals);
      }

      if (elapsed < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !observed.has(e.target)) {
        observed.add(e.target);
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(el => io.observe(el));
}

/* ── PREMIUM INTERACTIVE INERTIAL SMOOTH SCROLLER (Lenis Engine integration) ── */
function initPremiumSmoothScroll() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js";
  script.onload = () => {
    if (!window.Lenis) return;
    
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.addEventListener('resize', () => lenis.resize());
  };
  document.head.appendChild(script);
}

function initHeroParallax() {
  const sculpture = document.querySelector('.hero-sculpture');
  if (!sculpture) return;

  const layers = sculpture.querySelectorAll('.sculpture-layer');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    
    const rect = sculpture.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed);
      const yOffset = scrollY * speed;
      
      if (layer.classList.contains('sculpture-layer--back')) {
        layer.style.transform = `translate3d(0, ${yOffset}px, -150px) scale(1.15)`;
      } else if (layer.classList.contains('sculpture-layer--mid')) {
        layer.style.transform = `translate3d(0, ${yOffset}px, -50px)`;
      } else {
        layer.style.transform = `translate3d(0, ${yOffset}px, 50px)`;
      }
    });
  });
}

function initBeamsCanvas() {
  const canvas = document.getElementById('beamsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  if (!hero) return;

  const colors = [
    'rgba(99, 102, 241, 1)',   // Indigo primary
    'rgba(168, 85, 247, 1)',   // Purple accent
    'rgba(59, 130, 246, 1)'    // Blue ambient
  ];

  let beams = [];
  const beamCount = 14;

  function initBeams() {
    beams = [];
    const w = canvas.width || 1200;
    const h = canvas.height || 800;
    for (let i = 0; i < beamCount; i++) {
      const width = Math.random() * 120 + 80;
      const length = Math.random() * 800 + 800;
      beams.push({
        x: Math.random() * (w + 400) - 200,
        y: Math.random() * (h + length) - length,
        width: width,
        length: length,
        speed: Math.random() * 1.2 + 0.8, // Faster, more dynamic movement
        opacity: Math.random() * 0.12 + 0.08,
        pulseVal: Math.random() * 100,
        pulseSpeed: Math.random() * 0.01 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    canvas.width = hero.clientWidth || window.innerWidth;
    canvas.height = hero.clientHeight || 800;

    if (beams.length === 0 || oldWidth === 0 || oldHeight === 0) {
      initBeams();
    } else {
      // Scale beams to new canvas dimensions to prevent bunching
      beams.forEach(beam => {
        const pctX = (beam.x + 200) / (oldWidth + 400);
        beam.x = pctX * (canvas.width + 400) - 200;

        const pctY = (beam.y + beam.length) / (oldHeight + beam.length);
        beam.y = pctY * (canvas.height + beam.length) - beam.length;
      });
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dynamically adjust blend mode based on current theme to maintain visibility
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    ctx.globalCompositeOperation = theme === 'dark' ? 'screen' : 'source-over';

    beams.forEach(beam => {
      // Move beams vertically
      beam.y += beam.speed;
      
      // Recycle only when the ENTIRE beam has scrolled off-screen
      if (beam.y > canvas.height + beam.length / 2 + 100) {
        beam.y = -beam.length / 2 - 100;
        beam.x = Math.random() * (canvas.width + 400) - 200;
      }

      beam.pulseVal += beam.pulseSpeed;
      let currentOpacity = beam.opacity + 0.04 * Math.sin(beam.pulseVal);
      if (theme !== 'dark') {
        currentOpacity *= 0.6; // Soften visibility on light backgrounds
      }

      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate(-Math.PI / 6); // Rotate by 30 degrees for diagonal orientation

      const grad = ctx.createLinearGradient(0, -beam.length / 2, 0, beam.length / 2);
      const colorBase = beam.color.substring(0, beam.color.lastIndexOf(',') + 1);
      
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.3, `${colorBase} ${currentOpacity})`);
      grad.addColorStop(0.7, `${colorBase} ${currentOpacity})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(-beam.width / 2, -beam.length / 2, beam.width, beam.length);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  syncCartBadge();
  initReveal();
  initSmoothScroll();
  initCountUp();
  initPremiumSmoothScroll();
  initHeroParallax();
  initBeamsCanvas();

  const page = location.pathname.split('/').pop();

  if (page === 'cart' || page === 'cart.html') {
    initCartPage();
  } else if (page === '' || page === 'index.html') {
    PRODUCTS = FALLBACK_PRODUCTS.map(normaliseProduct);
    renderHomeGrid();
    loadProductsFromBackend();
  } else if (page === 'products' || page === 'products.html') {
    PRODUCTS = FALLBACK_PRODUCTS.map(normaliseProduct);
    initProductsPage();
    loadProductsFromBackend();
  }
});