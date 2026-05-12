/*
  DexterStore — script.js
  Author: Dexter
  Backend: Spring Boot REST API → https://dexterstore-backend.onrender.com
  Frontend: Pure HTML/CSS/JS on Live Server (127.0.0.1:5500)
*/

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIG
   Change API_BASE if your Spring Boot port ever changes.
───────────────────────────────────────────────────────────── */
const API_BASE = 'https://dexterstore-backend.onrender.com/api/products';

/* ─────────────────────────────────────────────────────────────
   PRODUCTS — starts empty, filled by loadProductsFromBackend()
   All render functions read from this array, so once it's
   populated everything works exactly like the static version.
───────────────────────────────────────────────────────────── */
let PRODUCTS = [];

/* ─────────────────────────────────────────────────────────────
   FALLBACK DATA
   Shown instantly while the API call is in-flight, and used
   permanently if the backend is unreachable (CORS error, server
   down, etc.) so the page is never blank.
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   normaliseProduct()
   Spring Boot returns: { id, name, price, image }
   Our UI expects:      { id, name/title, price, image/img, + extras }
   This function bridges both shapes so buildCard() always works
   whether data comes from the API or the fallback array.
───────────────────────────────────────────────────────────── */
function normaliseProduct(p) {
  return {
    id:            p.id,
    /* name field — API sends "name", fallback uses "name" too */
    name:          p.name  || p.title || 'Untitled Product',
    /* price — keep as number */
    price:         Number(p.price) || 0,
    /* image — API sends "image", fallback uses "image" */
    image:         p.image || p.img || '',
    /* optional enrichment fields — present in fallback, may be
       absent from API; safe defaults keep the card rendering clean */
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

/* ─────────────────────────────────────────────────────────────
   loadProductsFromBackend()
   Fetches from Spring Boot. On success, populates PRODUCTS and
   re-renders whichever grid is on the current page.
   On any failure, falls back gracefully — UI stays visible.
───────────────────────────────────────────────────────────── */
async function loadProductsFromBackend() {
    try {
        const response = await fetch(API_BASE);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

PRODUCTS = data.map(normaliseProduct);
}
catch (error) {
    console.error(error);
}

const page = location.pathname.split('/').pop() || 'index.html';

if (page === '' || page === 'index.html') {
    renderHomeGrid();
}

if (page === 'products.html') {
    initProductsPage();
}
}

/* ─────────────────────────────────────────────────────────────
   CART — backed by localStorage so it persists across pages
───────────────────────────────────────────────────────────── */
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
      title:         p.name,       /* normalised field */
      price:         p.price,
      img:           p.image,      /* normalised field */
      categoryLabel: p.categoryLabel,
    });
    this.save(arr);
    return true;
  },

  remove(id) { this.save(this.get().filter(i => i.id !== id)); },
};

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type ? ' toast--' + type : '') + ' show';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}
window.showToast = showToast;

/* ─────────────────────────────────────────────────────────────
   CART BADGE
───────────────────────────────────────────────────────────── */
function syncCartBadge() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = Cart.count();
}

/* ─────────────────────────────────────────────────────────────
   buildCard(p)
   Accepts a normalised product object and returns card HTML.
   Uses p.name and p.image (normalised field names).
───────────────────────────────────────────────────────────── */
function buildCard(p) {
  const safeRating = Math.min(5, Math.max(0, Math.round(p.rating)));
  const stars      = '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  const badge      = p.badge
    ? `<span class="pc-badge pc-badge--${p.badgeColor}">${p.badge}</span>`
    : '';
  const oldPx = p.oldPrice
    ? `<span class="pc-price-old">$${p.oldPrice}</span>`
    : '';

  /* Use p.image (normalised); fall back to a plain grey placeholder */
  const imgSrc = p.image || 'https://placehold.co/600x375?text=No+Image';

  return `
<div class="product-card reveal" data-id="${p.id}">
  <div class="pc-thumb">
    <img src="${imgSrc}" alt="${p.name}" loading="lazy"
         onerror="this.src='https://placehold.co/600x375?text=No+Image'">
    ${badge}
    <div class="pc-overlay">
      <button class="btn btn-white-solid btn-sm"
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
    <h3 class="pc-title">${p.name}</h3>
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

/* ─────────────────────────────────────────────────────────────
   addToCart()
   Looks up product by id in the live PRODUCTS array so cart
   always gets the fresh backend data (including correct price).
───────────────────────────────────────────────────────────── */
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
    btn.style.cssText = 'background:#16A34A;border-color:#16A34A;opacity:1;';
  } else {
    showToast('Already in your cart.', '');
  }
};

/* ─────────────────────────────────────────────────────────────
   renderHomeGrid()
   Renders first 6 products on index.html.
   Called once by loadProductsFromBackend() after PRODUCTS is ready.
───────────────────────────────────────────────────────────── */
function renderHomeGrid() {
  const grid = document.getElementById('homeProductGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.slice(0, 6).map(buildCard).join('');
  initReveal();
}

/* ─────────────────────────────────────────────────────────────
   renderProductGrid()
   Applies active filter + sort then re-renders the full grid.
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   initProductsPage()
   Wires up filter tabs and sort select on products.html.
   renderProductGrid() is called here after PRODUCTS is loaded.
───────────────────────────────────────────────────────────── */
function initProductsPage() {
  const tabsEl = document.getElementById('filterTabs');
  const sortEl = document.getElementById('sortSelect');

  if (tabsEl) {
    /* Remove old listeners by cloning, then re-attach */
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

/* ─────────────────────────────────────────────────────────────
   initCartPage()
   Renders cart items from localStorage and wires up summary,
   coupon logic, and checkout button.
───────────────────────────────────────────────────────────── */
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
        <a href="products.html" class="btn btn-primary">Browse products</a>
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
        couponMsg.style.color = '#16A34A';
        updateSummary();
      } else {
        couponMsg.textContent = 'Invalid code. Try DEXTER20, LAUNCH10 or SAVE15.';
        couponMsg.style.color = '#DC2626';
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

/* ─────────────────────────────────────────────────────────────
   NAVBAR — scroll shadow + mobile hamburger
───────────────────────────────────────────────────────────── */
function initNavbar() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 18);
    }, { passive: true });
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  }
}

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────────── */
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
  }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });
  els.forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   SMOOTH SCROLL
───────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   BOOT
   Order matters:
   1. UI chrome (navbar, badge, reveal, scroll) — instant, no data needed
   2. Cart page — reads localStorage, no API needed
   3. Product pages — show fallback immediately, then replace with
      live API data when the fetch resolves
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  syncCartBadge();
  initReveal();
  initSmoothScroll();

  const page = location.pathname.split('/').pop();

if (page === 'cart' || page === 'cart.html') {
    initCartPage();
}
else if (
    page === '' ||
    page === 'index.html'
) {
    PRODUCTS = FALLBACK_PRODUCTS.map(normaliseProduct);
    renderHomeGrid();
    loadProductsFromBackend();
}
else if (
    page === 'products' ||
    page === 'products.html'
) {
    PRODUCTS = FALLBACK_PRODUCTS.map(normaliseProduct);
    initProductsPage();
    loadProductsFromBackend();
}

});