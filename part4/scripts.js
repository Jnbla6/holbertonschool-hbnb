/**
 * HBNB — Main Scripts
 * Handles: theme toggle, place card rendering, filtering, auth state, forms
 */

'use strict';

/* ════════════════════════════════════════════════════════
   SAMPLE DATA — replace with real API calls
   ════════════════════════════════════════════════════════ */
const PLACES_DATA = [
  {
    id: '1',
    name: 'Luxury Oceanfront Bungalow',
    location: 'Malibu, California',
    price: 320,
    rating: 4.97,
    reviews: 128,
    type: 'villa',
    guests: 8,
    bedrooms: 4,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    badge: 'Superhost',
  },
  {
    id: '2',
    name: 'Downtown Penthouse Suite',
    location: 'New York, USA',
    price: 185,
    rating: 4.89,
    reviews: 74,
    type: 'apartment',
    guests: 4,
    bedrooms: 2,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    badge: 'Top Rated',
  },
  {
    id: '3',
    name: 'Alpine Mountain Cabin',
    location: 'Innsbruck, Austria',
    price: 98,
    rating: 4.95,
    reviews: 210,
    type: 'cabin',
    guests: 6,
    bedrooms: 3,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80',
    badge: 'Guest Favourite',
  },
  {
    id: '4',
    name: 'Tropical Villa with Pool',
    location: 'Bali, Indonesia',
    price: 145,
    rating: 4.92,
    reviews: 347,
    type: 'villa',
    guests: 10,
    bedrooms: 5,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80',
    badge: 'Popular',
  },
  {
    id: '5',
    name: 'Modern Loft Studio',
    location: 'Paris, France',
    price: 120,
    rating: 4.80,
    reviews: 56,
    type: 'apartment',
    guests: 2,
    bedrooms: 1,
    image: 'https://images.unsplash.com/photo-1523192193543-6e7296d960e4?w=600&q=80',
    badge: null,
  },
  {
    id: '6',
    name: 'Desert Adobe Retreat',
    location: 'Sedona, Arizona',
    price: 210,
    rating: 4.98,
    reviews: 95,
    type: 'house',
    guests: 6,
    bedrooms: 3,
    image: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=600&q=80',
    badge: 'Rare Find',
  },
];

/* ════════════════════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function getCookie(name) {
  return document.cookie.split('; ')
    .find(r => r.startsWith(name + '='))
    ?.split('=')[1] || null;
}

function isLoggedIn() {
  return getCookie('auth-token') !== null || localStorage.getItem('hbnb-user') !== null;
}

/* ════════════════════════════════════════════════════════
   THEME TOGGLE  (persists via localStorage)
   ════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('hbnb-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateToggleIcon(saved);
}

function updateToggleIcon(theme) {
  const moonIcon = document.getElementById('icon-moon');
  const sunIcon  = document.getElementById('icon-sun');
  const btn = $('#theme-toggle');
  if (!btn) return;

  if (theme === 'dark') {
    if (moonIcon) moonIcon.style.display = 'none';
    if (sunIcon)  sunIcon.style.display  = 'block';
    btn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    if (moonIcon) moonIcon.style.display = 'block';
    if (sunIcon)  sunIcon.style.display  = 'none';
    btn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

function setupThemeToggle() {
  const btn = $('#theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hbnb-theme', next);
    updateToggleIcon(next);
  });
}

/* ════════════════════════════════════════════════════════
   RENDER PLACE CARDS
   ════════════════════════════════════════════════════════ */
/* SVG icons as strings for card injection */
const SVG_STAR = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" style="vertical-align:-1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const SVG_PIN  = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const SVG_HEART_EMPTY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const SVG_HEART_FULL  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FF385C" stroke="#FF385C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

function createPlaceCard(place) {
  const card = document.createElement('article');
  card.className = 'place-card';
  card.dataset.price = place.price;
  card.dataset.type = place.type;

  const badgeHTML = place.badge
    ? `<span class="place-card-badge">${place.badge}</span>`
    : '';

  card.innerHTML = `
    <div class="place-card-image">
      <img
        src="${place.image}"
        alt="${place.name}"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'"
      >
      ${badgeHTML}
      <button class="place-card-wishlist" aria-label="Save ${place.name} to wishlist" data-id="${place.id}" aria-pressed="false">${SVG_HEART_EMPTY}</button>
    </div>
    <div class="place-card-body">
      <div class="place-card-location">${SVG_PIN} ${place.location}</div>
      <h3 class="place-card-name">${place.name}</h3>
      <div class="place-card-meta">${place.guests} guests &middot; ${place.bedrooms} bedroom${place.bedrooms > 1 ? 's' : ''}</div>
      <div class="place-card-footer">
        <div class="place-card-price">
          <span class="price-amount">${formatPrice(place.price)}</span>
          <span class="price-period">/ night</span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.45rem;">
          <div class="place-card-rating" aria-label="Rated ${place.rating} out of 5">
            ${SVG_STAR} ${place.rating}
            <span style="color:var(--text-secondary); font-weight:400;">(${place.reviews})</span>
          </div>
          <a href="place.html?id=${place.id}" class="details-button" aria-label="View details for ${place.name}">View Details</a>
        </div>
      </div>
    </div>
  `;

  // Wishlist toggle
  const wishBtn = card.querySelector('.place-card-wishlist');
  wishBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isSaved = wishBtn.getAttribute('aria-pressed') === 'true';
    wishBtn.setAttribute('aria-pressed', String(!isSaved));
    wishBtn.innerHTML = isSaved ? SVG_HEART_EMPTY : SVG_HEART_FULL;
  });

  return card;
}

function renderPlaces(places) {
  const list = $('#places-list');
  if (!list) return;

  list.innerHTML = '';

  if (!places.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🏠</span>
        <h3>No places found</h3>
        <p>Try adjusting your filters to see more options.</p>
      </div>
    `;
    return;
  }

  const frag = document.createDocumentFragment();
  places.forEach(place => frag.appendChild(createPlaceCard(place)));
  list.appendChild(frag);

  const countEl = $('#results-count');
  if (countEl) {
    countEl.textContent = `${places.length} place${places.length !== 1 ? 's' : ''}`;
  }
}

/* ════════════════════════════════════════════════════════
   FILTER LOGIC
   ════════════════════════════════════════════════════════ */
function applyFilters() {
  const maxPrice = ($('#price-filter') || {}).value || 'all';
  const type = ($('#type-filter') || {}).value || 'all';

  const filtered = PLACES_DATA.filter(p => {
    const priceOk = maxPrice === 'all' || p.price <= Number(maxPrice);
    const typeOk = type === 'all' || p.type === type;
    return priceOk && typeOk;
  });

  renderPlaces(filtered);
}

/* ════════════════════════════════════════════════════════
   AUTH STATE
   ════════════════════════════════════════════════════════ */
function updateAuthState() {
  const loginLink = $('.login-button') || $('#login-link');
  if (!loginLink) return;
  if (isLoggedIn()) {
    loginLink.textContent = 'My account';
  }
}

/* ════════════════════════════════════════════════════════
   LOGIN FORM
   ════════════════════════════════════════════════════════ */
function initLoginForm() {
  const form = $('#login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = ($('#email') || {}).value?.trim();
    const password = ($('#password') || {}).value;
    if (!email || !password) return;

    const btn = $('#login-submit-btn');
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    setTimeout(() => {
      localStorage.setItem('hbnb-user', JSON.stringify({ email }));
      document.cookie = 'auth-token=mock-token; path=/; max-age=86400';
      window.location.href = 'index.html';
    }, 900);
  });

  // Social login stubs
  $$('#google-login-btn, #github-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('OAuth integration coming soon!');
    });
  });
}

/* ════════════════════════════════════════════════════════
   REVIEW FORM
   ════════════════════════════════════════════════════════ */
function initReviewForm() {
  // Character counter
  const reviewTextarea = $('#review');
  const counter = $('#char-count');
  if (reviewTextarea && counter) {
    reviewTextarea.addEventListener('input', () => {
      counter.textContent = reviewTextarea.value.length;
    });
  }

  // Star rating label
  const ratingLabels = { '5': 'Excellent', '4': 'Great', '3': 'Good', '2': 'Fair', '1': 'Poor' };
  const ratingLabelEl = $('#rating-label');
  $$('input[name="rating"]').forEach(input => {
    input.addEventListener('change', () => {
      if (ratingLabelEl) ratingLabelEl.textContent = ratingLabels[input.value] || '';
    });
  });

  // Form submit
  const form = $('#review-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#submit-review-btn');
    if (!btn) return;

    btn.textContent = 'Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Review submitted!';
      btn.style.background = '#008a80';
      form.reset();
      if (ratingLabelEl) ratingLabelEl.textContent = '';
      if (counter) counter.textContent = '0';

      setTimeout(() => {
        window.location.href = 'place.html';
      }, 1200);
    }, 800);
  });
}

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Always run first
  initTheme();
  setupThemeToggle();
  updateAuthState();

  // Index page
  if ($('#places-list')) {
    renderPlaces(PLACES_DATA);
    $('#price-filter')?.addEventListener('change', applyFilters);
    $('#type-filter')?.addEventListener('change', applyFilters);
    $('#search-btn')?.addEventListener('click', applyFilters);
  }

  // Login page
  initLoginForm();

  // Review forms (place.html inline + add_review.html)
  initReviewForm();
});