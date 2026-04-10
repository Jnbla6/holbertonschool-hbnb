import { getCookie, escapeHTML} from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { isLoggedIn, checkAuthentication, initAccountMenu } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();

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
    
    function updatePriceCalc(nights) {
      if (nights <= 0) nights = 1;
      const baseTotal = place.price * nights;
      const cleaningFee = Math.round(baseTotal * 0.08);
      const serviceFee = Math.round(baseTotal * 0.12);
      const finalTotal = baseTotal + cleaningFee + serviceFee;
  
      const calcBaseLabel = document.getElementById('detail-calc-base-label');
      if (calcBaseLabel) calcBaseLabel.innerHTML = `$${place.price} &times; ${nights} night${nights > 1 ? 's' : ''}`;
      
      const calcBaseVal = document.getElementById('detail-calc-base-val');
      if (calcBaseVal) calcBaseVal.textContent = `$${baseTotal}`;
      
      const calcClean = document.getElementById('detail-calc-cleaning');
      if (calcClean) calcClean.textContent = `$${cleaningFee}`;
      
      const calcService = document.getElementById('detail-calc-service');
      if (calcService) calcService.textContent = `$${serviceFee}`;
      
      const calcTotal = document.getElementById('detail-calc-total');
      if (calcTotal) calcTotal.textContent = `$${finalTotal}`;
    }

    // Default to 1 night if no dates selected.
    updatePriceCalc(1);

    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');

    // Add min date attributes
    const today = new Date().toISOString().split('T')[0];
    if (checkinInput) {
      checkinInput.setAttribute('min', today);
      checkinInput.addEventListener('change', () => {
        if (checkoutInput) checkoutInput.setAttribute('min', checkinInput.value);
        handleDateChange();
      });
    }

    function handleDateChange() {
      if (checkinInput && checkoutInput && checkinInput.value && checkoutInput.value) {
        const date1 = new Date(checkinInput.value);
        const date2 = new Date(checkoutInput.value);
        const diffTime = date2 - date1;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          updatePriceCalc(diffDays);
        } else {
          updatePriceCalc(1);
        }
      } else {
        updatePriceCalc(1);
      }
    }

    if (checkoutInput) checkoutInput.addEventListener('change', handleDateChange);

    const guestBook = document.getElementById('detail-guests-booking');
    if (guestBook) guestBook.textContent = `Up to ${place.max_guests || 1}`;

    const ratingDisplay = place.reviews > 0 ? `${place.rating} &middot; ${place.reviews} review${place.reviews !== 1 ? 's' : ''}` : 'New';
    const ratingHeroEl = document.getElementById('detail-rating-hero');
    if (ratingHeroEl) ratingHeroEl.innerHTML = ratingDisplay;
    const ratingBookingEl = document.getElementById('detail-rating-booking');
    if (ratingBookingEl) ratingBookingEl.innerHTML = ratingDisplay;

    const imageEl = document.getElementById('detail-image');
    if (imageEl) {
      imageEl.src = place.image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80';
      imageEl.alt = placeName;
    }

    const mapEl = document.getElementById('detail-map');
    if (mapEl && typeof L !== 'undefined') {
        const lat = parseFloat(place.latitude) || 24.7136;
        const lng = parseFloat(place.longitude) || 46.6753;
        const placeMap = L.map('detail-map', {
            zoomControl: true,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false
        }).setView([lat, lng], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(placeMap);
        L.marker([lat, lng]).addTo(placeMap);
    }

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
          const isUrl = am.icon && (am.icon.startsWith('http') || am.icon.includes('/'));
          const iconHtml = isUrl ? 
            `<img src="${am.icon}" alt="${escapeHTML(am.name)}" style="width: 1.5rem; height: 1.5rem; border-radius: 4px; object-fit: cover;">` : 
            `<span class="amenity-icon" style="font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">${am.icon || '✓'}</span>`;
          amEl.innerHTML = `
            ${iconHtml}
            <span>${escapeHTML(am.name)}</span>
          `;
          amenitiesContainer.appendChild(amEl);
        });
      } else {
        amenitiesContainer.innerHTML = '<span style="color:var(--text-secondary)">No amenities listed.</span>';
      }
    }

    const reviewsGrid = document.getElementById('detail-reviews-grid');
    const reviewsHeader = document.getElementById('detail-reviews-header');
    
    async function loadReviews() {
      try {
        const revRes = await fetch(`http://127.0.0.1:8080/api/v1/places/${placeId}/reviews`);
        if (!revRes.ok) return;
        const reviews = await revRes.json();
        
        if (reviewsHeader) {
          if (reviews.length === 0) {
            reviewsHeader.textContent = 'No reviews yet';
          } else {
            const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2);
            reviewsHeader.textContent = `${avg} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
          }
        }
        
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
                <div class="reviewer-avatar" style="background:${color};" aria-hidden="true">${escapeHTML(r.user_initial || '?')}</div>
                <div>
                  <div class="reviewer-name">${escapeHTML(r.user_name || 'Anonymous')}</div>
                  <div class="reviewer-date">${date}</div>
                </div>
              </div>
              <div class="review-rating" aria-label="${r.rating} out of 5 stars">${stars}</div>
              <p class="review-text">${escapeHTML(r.text)}</p>
            `;
            reviewsGrid.appendChild(article);
          });
        }
      } catch (e) {
        console.error('Error loading reviews:', e);
      }
    }
    
    await loadReviews();
    
    const bookNowBtn = document.getElementById('book-now-btn');
    if (bookNowBtn) {
      if (!isLoggedIn()) {
        bookNowBtn.href = 'login.html';
        bookNowBtn.textContent = 'Log in to Reserve';
      } else {
        bookNowBtn.href = `add_review.html?id=${placeId}`;
      }
    }


  } catch (error) {
    console.error('Error fetching place details:', error);
  }
});
