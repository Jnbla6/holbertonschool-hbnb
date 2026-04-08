import { $, formatPrice, getCookie } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';

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

function displayPlaces(places) {
  const list = document.getElementById('places-list');
  if (!list) return;
  list.innerHTML = '';
  
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
    const formattedPlace = {
      id: place.id,
      name: place.title || place.name || 'Untitled Place',
      location: (place.city && place.country) ? `${place.city}, ${place.country}` : (place.city || place.country || place.location || 'Unknown Location'),
      price: place.price,
      rating: place.rating || 'New',
      reviews: place.reviews || 0,
      type: place.type || 'place',
      guests: place.max_guests || place.guests || 1,
      bedrooms: place.number_rooms || place.bedrooms || 1,
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

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    checkAuthentication((token) => {
        fetchPlaces(token);
    });
    initAccountMenu();
    
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) priceFilter.addEventListener('change', applyAllFilters);
    
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) locationFilter.addEventListener('change', applyAllFilters);
});
