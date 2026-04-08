import { $, $$, getCookie } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();

  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('id');

  if (!placeId) {
    alert("Place not specified!");
    window.location.href = 'index.html';
    return;
  }

  // Fetch place details for context
  try {
    const res = await fetch(`http://127.0.0.1:8080/api/v1/places/${placeId}`);
    if (res.ok) {
      const place = await res.json();
      const placeName = place.title || place.name || 'Untitled Place';
      const nameEl = $('#review-place-name');
      if (nameEl) nameEl.textContent = placeName;
      
      const city = place.city || '';
      const country = place.country || '';
      const locEl = $('#review-place-loc');
      if (locEl) locEl.textContent = city && country ? `${city}, ${country}` : (city || country || 'Unknown location');
      
      const img = $('#review-place-image');
      if (img) img.src = place.image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80';
    }
  } catch (err) {
    console.error("Error fetching place context:", err);
  }

  const token = getCookie('token');
  if (token) {
    try {
      // Decode JWT to get user ID
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userId = decodedPayload.sub;

      const userRes = await fetch(`http://127.0.0.1:8080/api/v1/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const user = await userRes.json();
        const reviewerNameInput = document.getElementById('reviewer-name');
        if (reviewerNameInput) {
          reviewerNameInput.value = `${user.first_name} ${user.last_name}`;
          reviewerNameInput.readOnly = true;
          reviewerNameInput.style.backgroundColor = 'var(--bg-hover)';
        }
      }
    } catch (e) {
      console.error("Could not fetch user info for review name", e);
    }
  }

  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) cancelBtn.href = `place.html?id=${placeId}`;

  const reviewTextarea = $('#review');
  const counter = $('#char-count');
  if (reviewTextarea && counter) {
    reviewTextarea.addEventListener('input', () => {
      counter.textContent = reviewTextarea.value.length;
    });
  }

  const ratingLabels = { '5': 'Excellent', '4': 'Great', '3': 'Good', '2': 'Fair', '1': 'Poor' };
  const ratingLabelEl = $('#rating-label');
  $$('input[name="rating"]').forEach(input => {
    input.addEventListener('change', () => {
      if (ratingLabelEl) ratingLabelEl.textContent = ratingLabels[input.value] || '';
    });
  });

  const form = $('#review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#submit-review-btn');
    if (!btn) return;

    const rating = form.querySelector('input[name="rating"]:checked');
    const text = reviewTextarea?.value?.trim();
    
    if (!rating || !text) {
      alert('Please select a rating and write your review.');
      return;
    }

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
        btn.textContent = '✓ Review submitted!';
        btn.style.background = '#008a80';
        form.reset();
        if (ratingLabelEl) ratingLabelEl.textContent = '';
        if (counter) counter.textContent = '0';

        setTimeout(() => {
          window.location.href = `place.html?id=${placeId}`;
        }, 1200);
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
});

