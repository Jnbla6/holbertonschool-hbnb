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
  return getCookie('token') !== null;
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
  card.dataset.location = place.location || '';

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

  // Admin delete button
  if (localStorage.getItem('is_admin') === 'true') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'admin-delete-btn';
    deleteBtn.innerHTML = '🗑 Delete';
    deleteBtn.style.cssText = 'position:absolute; bottom:0.6rem; right:0.6rem; background:#FF385C; color:#fff; border:none; padding:0.35rem 0.7rem; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer; z-index:5; opacity:0.9; transition:opacity 0.2s;';
    deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
    deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0.9');
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm(`Are you sure you want to delete "${place.name}"? This cannot be undone.`)) return;
      try {
        const res = await fetch(`http://127.0.0.1:8080/api/v1/places/${place.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getCookie('token')}` }
        });
        if (res.ok) {
          card.remove();
          alert('Place deleted successfully!');
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to delete place');
        }
      } catch (err) {
        alert('Network error');
      }
    });
    card.querySelector('.place-card-image').appendChild(deleteBtn);
  }

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
   AUTH STATE & PLACES FETCH
   ════════════════════════════════════════════════════════ */
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  const accountMenu = document.getElementById('account-menu');
  const addPlaceLink = document.getElementById('add-place-link');

  const isOwner = localStorage.getItem('is_owner') === 'true';

  if (!token) {
    if (loginLink) loginLink.style.display = 'block';
    if (accountMenu) accountMenu.style.display = 'none';
    if (addPlaceLink) addPlaceLink.style.display = 'none';
  } else {
    if (loginLink) loginLink.style.display = 'none';
    if (accountMenu) accountMenu.style.display = 'block';
    
    if (isOwner && addPlaceLink) {
      addPlaceLink.style.display = 'block';
    } else if (addPlaceLink) {
      addPlaceLink.style.display = 'none';
    }

    // Show admin link
    const adminLink = document.getElementById('admin-link');
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (adminLink) {
      adminLink.style.display = isAdmin ? 'block' : 'none';
    }
  }
  
  // Fetch places data
  fetchPlaces(token);
}

function initAccountMenu() {
  const accountBtn = document.getElementById('account-btn');
  const accountDropdown = document.getElementById('account-dropdown');
  const logoutLink = document.getElementById('logout-link');
  const becomeOwnerLink = document.getElementById('become-owner-link');
  const switchTravelerLink = document.getElementById('switch-traveler-link');

  const isOwner = localStorage.getItem('is_owner') === 'true';

  if (becomeOwnerLink && switchTravelerLink) {
    if (isOwner) {
      becomeOwnerLink.style.display = 'none';
      switchTravelerLink.style.display = 'block';
    } else {
      becomeOwnerLink.style.display = 'block';
      switchTravelerLink.style.display = 'none';
    }

    becomeOwnerLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('is_owner', 'true');
      window.location.reload();
    });

    switchTravelerLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('is_owner');
      window.location.reload();
    });
  }

  if (accountBtn && accountDropdown) {
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = accountDropdown.style.display === 'block';
      accountDropdown.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!accountDropdown.contains(e.target) && !accountBtn.contains(e.target)) {
        accountDropdown.style.display = 'none';
      }
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.cookie = 'token=; Max-Age=0; path=/';
      localStorage.removeItem('is_admin');
      localStorage.removeItem('is_owner');
      window.location.reload();
    });
  }
}

async function fetchPlaces(token) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('http://127.0.0.1:8080/api/v1/places/', {
      method: 'GET',
      headers: headers
    });
    
    if (response.ok) {
      const places = await response.json();
      displayPlaces(places);
    } else {
      console.error('Failed to fetch places', response.status);
    }
  } catch (error) {
    console.error('Error fetching places:', error);
  }
}

function displayPlaces(places) {
  const list = document.getElementById('places-list');
  if (!list) return;
  list.innerHTML = '';
  
  // Populate location filter dropdown
  populateLocationFilter(places);
  
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
  places.forEach(place => {
    // Standardize object for createPlaceCard
    const formattedPlace = {
      id: place.id,
      name: place.title || place.name || 'Untitled Place',
      location: (place.city && place.country) ? `${place.city}, ${place.country}` : (place.city || place.country || place.location || 'Unknown Location'),
      price: place.price,
      rating: place.rating || 'New',
      reviews: place.reviews || 0,
      type: place.type || 'place',
      guests: place.guests || 2,
      bedrooms: place.bedrooms || 1,
      image: place.image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
      badge: place.badge || null
    };
    
    const card = createPlaceCard(formattedPlace);
    frag.appendChild(card);
  });
  list.appendChild(frag);
  
  const countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.textContent = `${places.length} place${places.length !== 1 ? 's' : ''}`;
  }
}

function populateLocationFilter(places) {
  const locationFilter = document.getElementById('location-filter');
  if (!locationFilter) return;
  
  const locations = new Set();
  places.forEach(p => {
    const city = p.city || '';
    const country = p.country || '';
    if (city && country) locations.add(`${city}, ${country}`);
    else if (city) locations.add(city);
    else if (country) locations.add(country);
  });
  
  // Keep the "Anywhere" option, add unique locations
  locationFilter.innerHTML = '<option value="all">Anywhere</option>';
  [...locations].sort().forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    locationFilter.appendChild(opt);
  });
}

function applyAllFilters() {
  const priceFilter = document.getElementById('price-filter');
  const locationFilter = document.getElementById('location-filter');
  const placesList = document.getElementById('places-list');
  if (!placesList) return;

  const selectedPrice = priceFilter ? priceFilter.value : 'all';
  const selectedLocation = locationFilter ? locationFilter.value : 'all';

  const cards = placesList.querySelectorAll('.place-card');
  cards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    const location = card.dataset.location || '';

    const priceOk = selectedPrice === 'all' || price <= parseFloat(selectedPrice);
    const locationOk = selectedLocation === 'all' || location === selectedLocation;

    card.style.display = (priceOk && locationOk) ? 'block' : 'none';
  });
}

const priceFilter = document.getElementById('price-filter');
if (priceFilter) {
  priceFilter.addEventListener('change', applyAllFilters);
}

const locationFilter = document.getElementById('location-filter');
if (locationFilter) {
  locationFilter.addEventListener('change', applyAllFilters);
}


/* ════════════════════════════════════════════════════════
   LOGIN FORM
   ════════════════════════════════════════════════════════ */
function initLoginForm() {
  const form = $('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = ($('#email') || {}).value?.trim();
    const password = ($('#password') || {}).value;
    if (!email || !password) return;

    const btn = $('#login-submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
        if (data.is_admin) {
          localStorage.setItem('is_admin', 'true');
        } else {
          localStorage.removeItem('is_admin');
        }
        window.location.href = 'index.html';
      } else {
        const errData = await response.json();
        alert(errData.error || 'Invalid credentials');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch (error) {
      alert('Login failed. Please try again.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // Social login stubs
  $$('#google-login-btn, #github-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('OAuth integration coming soon!');
    });
  });
}

function initRegisterForm() {
  const form = $('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const first_name = ($('#first_name') || {}).value?.trim();
    const last_name = ($('#last_name') || {}).value?.trim();
    const email = ($('#email') || {}).value?.trim();
    const password = ($('#password') || {}).value;
    const confirm_password = ($('#confirm_password') || {}).value;
    
    if (!first_name || !last_name || !email || !password || !confirm_password) return;

    if (password !== confirm_password) {
      alert('Passwords do not match.');
      return;
    }

    const btn = $('#register-submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Signing up…';
    btn.disabled = true;

    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, password })
      });

      if (response.ok) {
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
      } else {
        const errData = await response.json();
        alert(errData.error || 'Registration failed');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

function initAddPlaceForm() {
  const form = document.getElementById('add-place-form');
  if (!form) return;

  const amContainer = document.getElementById('amenities-container');
  if (amContainer) {
    fetch('http://127.0.0.1:8080/api/v1/amenities/')
      .then(r => r.json())
      .then(amenities => {
        amContainer.innerHTML = '';
        amenities.forEach(am => {
          const lbl = document.createElement('label');
          lbl.style.display = 'flex';
          lbl.style.alignItems = 'center';
          lbl.style.gap = '0.4rem';
          lbl.style.cursor = 'pointer';
          lbl.innerHTML = `<input type="checkbox" name="amenities" value="${am.id}"> <span>${am.icon || '✓'}</span> <span>${am.name}</span>`;
          amContainer.appendChild(lbl);
        });
        if (amenities.length === 0) {
            amContainer.innerHTML = '<span style="color:var(--text-secondary)">No amenities available</span>';
        }
      });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title')?.value?.trim();
    const description = document.getElementById('description')?.value?.trim();
    const price = document.getElementById('price')?.value;
    const max_guests = document.getElementById('max_guests')?.value;
    const number_rooms = document.getElementById('number_rooms')?.value;
    const number_bathrooms = document.getElementById('number_bathrooms')?.value;
    const city = document.getElementById('city')?.value?.trim();
    const country = document.getElementById('country')?.value?.trim();
    const latitude = document.getElementById('latitude')?.value;
    const longitude = document.getElementById('longitude')?.value;
    const imageInput = document.getElementById('image_url');
    
    if (!title || !description || !price || !latitude || !longitude || !max_guests || !number_rooms || !number_bathrooms || !city || !country) return;

    const btn = document.getElementById('add-place-submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('max_guests', max_guests);
    formData.append('number_rooms', number_rooms);
    formData.append('number_bathrooms', number_bathrooms);
    formData.append('city', city);
    formData.append('country', country);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (imageInput && imageInput.files[0]) {
      formData.append('image_file', imageInput.files[0]);
    }
    const checkedAms = form.querySelectorAll('input[name="amenities"]:checked');
    checkedAms.forEach(cb => formData.append('amenities', cb.value));

    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/places/', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${getCookie('token')}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Place added successfully!');
        window.location.href = 'index.html';
      } else {
        const errData = await response.json();
        
        if (response.status === 401) {
            alert('Your session has expired or is invalid. Please log in again.');
            document.cookie = 'token=; Max-Age=0; path=/';
            window.location.href = 'login.html';
            return;
        }

        alert(errData.error || errData.message || errData.msg || 'Failed to add place');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch (error) {
      alert('Network error. Please try again.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

/* ════════════════════════════════════════════════════════
   PLACE DETAILS
   ════════════════════════════════════════════════════════ */
async function initPlaceDetails() {
  if (!document.getElementById('detail-title')) return;

  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('id');
  
  if (!placeId) {
    alert("Place not specified!");
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8080/api/v1/places/${placeId}`);
    if (!response.ok) {
      alert("Place not found!");
      window.location.href = 'index.html';
      return;
    }
    const place = await response.json();
    
    const placeName = place.title || place.name || 'Untitled Place';
    document.title = placeName + ' — HBNB';
    
    // Location badge
    const locationText = document.getElementById('detail-location-text');
    if (locationText) {
      const city = place.city || '';
      const country = place.country || '';
      locationText.textContent = city && country ? `${city}, ${country}` : (city || country || 'Unknown location');
    }
    
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = placeName;
    
    const descEl = document.getElementById('detail-description');
    if (descEl) descEl.textContent = place.description || 'No description provided.';
    
    const maxPriceEl = document.getElementById('detail-max-price');
    if (maxPriceEl) maxPriceEl.textContent = `$${place.price}/night`;
    
    const guestsEl = document.getElementById('detail-guests');
    if (guestsEl) guestsEl.textContent = `${place.max_guests || 1} guest${place.max_guests > 1 ? 's' : ''}`;
    
    const bedsEl = document.getElementById('detail-bedrooms');
    if (bedsEl) bedsEl.textContent = `${place.number_rooms || 1} bedroom${place.number_rooms > 1 ? 's' : ''}`;
    
    const bathsEl = document.getElementById('detail-bathrooms');
    if (bathsEl) bathsEl.textContent = `${place.number_bathrooms || 1} bath${place.number_bathrooms > 1 ? 's' : ''}`;
    
    const bookPriceEl = document.getElementById('detail-booking-price');
    if (bookPriceEl) bookPriceEl.innerHTML = `$${place.price} <span>/ night</span>`;
    
    const nights = 7;
    const baseTotal = place.price * nights;
    const cleaningFee = Math.round(baseTotal * 0.08);
    const serviceFee = Math.round(baseTotal * 0.12);
    const finalTotal = baseTotal + cleaningFee + serviceFee;

    const calcBaseLabel = document.getElementById('detail-calc-base-label');
    if (calcBaseLabel) calcBaseLabel.innerHTML = `$${place.price} &times; ${nights} nights`;
    
    const calcBaseVal = document.getElementById('detail-calc-base-val');
    if (calcBaseVal) calcBaseVal.textContent = `$${baseTotal}`;
    
    const calcClean = document.getElementById('detail-calc-cleaning');
    if (calcClean) calcClean.textContent = `$${cleaningFee}`;
    
    const calcService = document.getElementById('detail-calc-service');
    if (calcService) calcService.textContent = `$${serviceFee}`;
    
    const calcTotal = document.getElementById('detail-calc-total');
    if (calcTotal) calcTotal.textContent = `$${finalTotal}`;

    const guestBook = document.getElementById('detail-guests-booking');
    if (guestBook) guestBook.textContent = `Up to ${place.max_guests || 1}`;

    const imageEl = document.getElementById('detail-image');
    if (imageEl) {
      imageEl.src = place.image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80';
      imageEl.alt = placeName;
    }

    // Fetch owner info
    if (place.owner_id) {
      try {
        const ownerRes = await fetch(`http://127.0.0.1:8080/api/v1/users/${place.owner_id}`);
        if (ownerRes.ok) {
          const owner = await ownerRes.json();
          const fullName = `${owner.first_name} ${owner.last_name}`;
          const headingEl = document.getElementById('detail-host-heading');
          if (headingEl) headingEl.textContent = `Hosted by ${fullName}`;
          const nameEl = document.getElementById('detail-host-name');
          if (nameEl) nameEl.textContent = fullName;
          const avatarEl = document.getElementById('detail-host-avatar');
          if (avatarEl) avatarEl.textContent = owner.first_name.charAt(0).toUpperCase();
        }
      } catch (err) {
        console.error('Error fetching owner:', err);
      }
    }

    const amenitiesContainer = document.getElementById('detail-amenities');
    if (amenitiesContainer) {
      amenitiesContainer.innerHTML = '';
      if (place.amenities && place.amenities.length > 0) {
        place.amenities.forEach(am => {
          const amEl = document.createElement('div');
          amEl.className = 'amenity-item';
          amEl.innerHTML = `
            <span class="amenity-icon" style="font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">${am.icon || '✓'}</span>
            <span>${am.name}</span>
          `;
          amenitiesContainer.appendChild(amEl);
        });
      } else {
        amenitiesContainer.innerHTML = '<span style="color:var(--text-secondary)">No amenities listed.</span>';
      }
    }

    // ======= LOAD REVIEWS =======
    const reviewsGrid = document.getElementById('detail-reviews-grid');
    const reviewsHeader = document.getElementById('detail-reviews-header');
    
    async function loadReviews() {
      try {
        const revRes = await fetch(`http://127.0.0.1:8080/api/v1/places/${placeId}/reviews`);
        if (!revRes.ok) return;
        const reviews = await revRes.json();
        
        // Header
        if (reviewsHeader) {
          if (reviews.length === 0) {
            reviewsHeader.textContent = 'No reviews yet';
          } else {
            const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2);
            reviewsHeader.textContent = `${avg} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
          }
        }
        
        // Cards
        if (reviewsGrid) {
          reviewsGrid.innerHTML = '';
          if (reviews.length === 0) {
            reviewsGrid.innerHTML = '<p style="color:var(--text-secondary);">Be the first to review this place!</p>';
            return;
          }
          
          const avatarColors = ['#FF385C', '#00A699', '#FC642D', '#484848', '#767676', '#914669'];
          reviews.forEach((r, i) => {
            const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            const color = avatarColors[i % avatarColors.length];
            
            const article = document.createElement('article');
            article.className = 'review-card';
            article.innerHTML = `
              <div class="review-card-header">
                <div class="reviewer-avatar" style="background:${color};" aria-hidden="true">${r.user_initial || '?'}</div>
                <div>
                  <div class="reviewer-name">${r.user_name || 'Anonymous'}</div>
                  <div class="reviewer-date">${date}</div>
                </div>
              </div>
              <div class="review-rating" aria-label="${r.rating} out of 5 stars">${stars}</div>
              <p class="review-text">${r.text}</p>
            `;
            reviewsGrid.appendChild(article);
          });
        }
      } catch (e) {
        console.error('Error loading reviews:', e);
      }
    }
    
    await loadReviews();

    // ======= REVIEW FORM SUBMIT =======
    const reviewForm = document.getElementById('review-form');
    const addReviewSection = document.getElementById('add-review');
    
    if (!isLoggedIn() && addReviewSection) {
      addReviewSection.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:1rem;"><a href="login.html" style="color:var(--primary, #FF385C); font-weight:600;">Log in</a> to leave a review.</p>';
    }
    
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = reviewForm.querySelector('input[name="rating"]:checked');
        const text = document.getElementById('review-text')?.value?.trim();
        
        if (!rating || !text) {
          alert('Please select a rating and write your review.');
          return;
        }
        
        const btn = document.getElementById('submit-review-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Submitting…';
        btn.disabled = true;
        
        try {
          const res = await fetch('http://127.0.0.1:8080/api/v1/reviews/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getCookie('token')}`
            },
            body: JSON.stringify({
              text: text,
              rating: parseInt(rating.value),
              place_id: placeId
            })
          });
          
          if (res.ok) {
            reviewForm.reset();
            btn.textContent = '✓ Review submitted!';
            btn.style.background = '#008a80';
            await loadReviews();
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.disabled = false;
            }, 2000);
          } else {
            const err = await res.json();
            alert(err.error || 'Failed to submit review');
            btn.textContent = originalText;
            btn.disabled = false;
          }
        } catch (err) {
          alert('Network error');
          btn.textContent = originalText;
          btn.disabled = false;
        }
      });
    }

  } catch (error) {
    console.error('Error fetching place details:', error);
  }
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

  // Index page
  if (document.getElementById('places-list')) {
    checkAuthentication();
    initAccountMenu();
  }

  // Login page
  initLoginForm();

  // Register page
  initRegisterForm();

  // Add Place page
  initAddPlaceForm();

  // Place Details page
  initPlaceDetails();

  // Review forms (place.html inline + add_review.html)
  initReviewForm();
});