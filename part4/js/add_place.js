import { getCookie } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();

  const form = document.getElementById('add-place-form');
  if (!form) return;

  const amContainer = document.getElementById('amenities-container');
  const amSelect = document.getElementById('amenity-select');
  const addAmBtn = document.getElementById('add-amenity-btn');
  const selectedAmenities = new Set();
  let availableAmenitiesList = [];

  if (amContainer && amSelect && addAmBtn) {
    fetch('http://127.0.0.1:8080/api/v1/amenities/')
      .then(r => r.json())
      .then(amenities => {
        availableAmenitiesList = amenities;
        document.getElementById('am-empty-state').textContent = 'No amenities added yet...';
        amenities.forEach(am => {
          const opt = document.createElement('option');
          opt.value = am.id;
          const isUrl = am.icon && (am.icon.startsWith('http') || am.icon.includes('/'));
          opt.textContent = isUrl ? am.name : `${am.icon || '✓'} ${am.name}`;
          amSelect.appendChild(opt);
        });
        if (amenities.length === 0) {
          document.getElementById('am-empty-state').textContent = 'No amenities available';
        }
      });

    addAmBtn.addEventListener('click', () => {
      const selectedId = amSelect.value;
      if (!selectedId) return;

      if (!selectedAmenities.has(selectedId)) {
        selectedAmenities.add(selectedId);
        
        const emptyState = document.getElementById('am-empty-state');
        if (emptyState) emptyState.style.display = 'none';

        const amData = availableAmenitiesList.find(a => a.id === selectedId);
        
        const badge = document.createElement('div');
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '0.5rem';
        badge.style.background = 'var(--border)';
        badge.style.padding = '0.3rem 0.6rem';
        badge.style.borderRadius = '20px';
        badge.style.fontSize = '0.85rem';
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'amenities';
        hiddenInput.value = selectedId;
        badge.appendChild(hiddenInput);

        const isUrl = amData.icon && (amData.icon.startsWith('http') || amData.icon.includes('/'));
        if (isUrl) {
            const img = document.createElement('img');
            img.src = amData.icon;
            img.style.width = '1.2rem';
            img.style.height = '1.2rem';
            img.style.borderRadius = '4px';
            img.style.objectFit = 'cover';
            badge.appendChild(img);
        } else {
            const iconSpan = document.createElement('span');
            iconSpan.textContent = amData.icon || '✓';
            badge.appendChild(iconSpan);
        }
        const text = document.createElement('span');
        text.textContent = amData.name;
        badge.appendChild(text);
        
        const removeBtn = document.createElement('span');
        removeBtn.textContent = '✖';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontSize = '0.75rem';
        removeBtn.style.color = 'var(--text)';
        removeBtn.style.marginLeft = '0.2rem';
        removeBtn.style.opacity = '0.7';
        removeBtn.addEventListener('click', () => {
          badge.remove();
          selectedAmenities.delete(selectedId);
          if (selectedAmenities.size === 0 && emptyState) {
            emptyState.style.display = 'block';
          }
        });
        badge.appendChild(removeBtn);
        
        amContainer.appendChild(badge);
      }
      amSelect.value = '';
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
    const selectedAms = form.querySelectorAll('input[name="amenities"]');
    selectedAms.forEach(input => formData.append('amenities', input.value));

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

  const pickerMapEl = document.getElementById('picker-map');
  if (pickerMapEl && typeof L !== 'undefined') {
    const defaultLoc = [24.7136, 46.6753];
    const map = L.map('picker-map').setView(defaultLoc, 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    let marker = null;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const loc = [pos.coords.latitude, pos.coords.longitude];
            map.setView(loc, 13);
        }, () => {});
    }

    map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      document.getElementById('latitude').value = lat.toFixed(6);
      document.getElementById('longitude').value = lng.toFixed(6);
      
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }
    });

    setTimeout(() => map.invalidateSize(), 500);
  }
});
