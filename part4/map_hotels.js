/**
 * HBNB Map — map_hotels.js
 * Hotel discovery map for Riyadh using Leaflet.js
 *
 * Modules:
 *   HotelData    – hotel data & filter helpers
 *   HotelMap     – Leaflet map instance
 *   HotelMarkers – custom L.divIcon price-tag markers
 *   HotelList    – sidebar hotel list cards
 *   HotelPanel   – slide-in detail panel (lazy DOM)
 *   UIControls   – search bar, filter chips, toast
 *   MapApp       – orchestrator / boot
 */

/* ═══════════════════════════════════════════════════════════════
   MODULE 1 – HotelData
   ═══════════════════════════════════════════════════════════════ */
const HotelData = (() => {

  const HOTELS = [
    {
      id: 1,
      name: 'Al Faisaliah Hotel',
      location: 'King Fahd Rd, Riyadh',
      lat: 24.6877, lng: 46.6863,
      rating: 4.9, reviews: 2340,
      pricePerNight: 780, priceTier: 'luxury',
      description: 'Iconic 267-metre tower offering panoramic Riyadh views, a sky-high restaurant inside a glass globe, and lavish five-star amenities.',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'],
      category: 'Luxury Hotel',
    },
    {
      id: 2,
      name: 'Four Seasons Riyadh',
      location: 'Kingdom Centre, Riyadh',
      lat: 24.7136, lng: 46.6753,
      rating: 4.8, reviews: 1895,
      pricePerNight: 950, priceTier: 'luxury',
      description: 'Occupying the top 30 floors of the Kingdom Centre, this is the pinnacle of Arabian luxury offering butler service and sky-high views.',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80',
      amenities: ['Pool', 'Spa', 'Gym', 'Butler service', 'Restaurant', 'Bar'],
      category: 'Luxury Resort',
    },
    {
      id: 3,
      name: 'Hyatt Regency Riyadh',
      location: 'Olaya District, Riyadh',
      lat: 24.7268, lng: 46.6344,
      rating: 4.5, reviews: 987,
      pricePerNight: 450, priceTier: 'luxury',
      description: 'Contemporary five-star hotel in the upscale Olaya business district, featuring spacious rooms, a full-service spa, and multiple dining outlets.',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Business center'],
      category: 'Business Hotel',
    },
    {
      id: 4,
      name: 'Novotel Riyadh Al Anoud',
      location: 'Al Anoud, Riyadh',
      lat: 24.6961, lng: 46.7219,
      rating: 4.2, reviews: 654,
      pricePerNight: 185, priceTier: 'mid',
      description: 'Modern mid-range hotel offering comfortable rooms, a rooftop pool, and easy access to Riyadh\'s main shopping and business districts.',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
      amenities: ['Pool', 'Gym', 'Restaurant', 'Breakfast', 'Wi-Fi'],
      category: 'Business Hotel',
    },
    {
      id: 5,
      name: 'InterContinental Riyadh',
      location: 'Al Murooj, Riyadh',
      lat: 24.7097, lng: 46.6745,
      rating: 4.6, reviews: 1102,
      pricePerNight: 520, priceTier: 'luxury',
      description: 'Set in lush gardens in the heart of Riyadh, this elegant hotel features multiple restaurants, manicured pools, and a renowned wellness spa.',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Garden', 'Concierge'],
      category: 'Luxury Hotel',
    },
    {
      id: 6,
      name: 'Riyadh Marriott Hotel',
      location: 'Al Ouruba Rd, Riyadh',
      lat: 24.6938, lng: 46.7054,
      rating: 4.4, reviews: 832,
      pricePerNight: 280, priceTier: 'mid',
      description: 'Polished full-service hotel close to the diplomatic quarter with expansive conference facilities and a relaxing outdoor pool.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      amenities: ['Pool', 'Gym', 'Restaurant', 'Business center', 'Wi-Fi'],
      category: 'Business Hotel',
    },
    {
      id: 7,
      name: 'Ritz-Carlton Riyadh',
      location: 'Al Hada District, Riyadh',
      lat: 24.7050, lng: 46.6891,
      rating: 4.9, reviews: 3102,
      pricePerNight: 1100, priceTier: 'luxury',
      description: 'A palatial oasis inspired by traditional Arabian architecture, surrounded by 52 acres of lush gardens. Legendary service and royal-level comfort.',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Butler service', 'Garden'],
      category: 'Luxury Palace',
    },
    {
      id: 8,
      name: 'Hilton Riyadh Hotel',
      location: 'Prince Sultan St, Riyadh',
      lat: 24.7198, lng: 46.6472,
      rating: 4.3, reviews: 745,
      pricePerNight: 220, priceTier: 'mid',
      description: 'Well-positioned hotel near the embassies and upscale neighbourhoods, offering reliable Hilton quality with a large outdoor pool and business facilities.',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
      amenities: ['Pool', 'Gym', 'Restaurant', 'Business center', 'Concierge'],
      category: 'Business Hotel',
    },
    {
      id: 9,
      name: 'Boudl Al Tahlia Suites',
      location: 'Al Tahlia St, Riyadh',
      lat: 24.7015, lng: 46.6600,
      rating: 3.9, reviews: 412,
      pricePerNight: 95, priceTier: 'budget',
      description: 'Comfortable apartment-style suites on the lively Al Tahlia strip — perfect for budget travellers who want to be close to cafes and restaurants.',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
      amenities: ['Kitchenette', 'Wi-Fi', 'Parking', 'Breakfast'],
      category: 'Budget Suites',
    },
    {
      id: 10,
      name: 'Radisson Blu Riyadh',
      location: 'Al Maather St, Riyadh',
      lat: 24.6820, lng: 46.7100,
      rating: 4.1, reviews: 589,
      pricePerNight: 160, priceTier: 'mid',
      description: 'Sleek Scandinavian-designed rooms south of the city centre, close to King Abdullah Financial District, with a rooftop pool and all-day dining.',
      image: 'https://images.unsplash.com/photo-1523192193543-6e7296d960e4?w=600&q=80',
      amenities: ['Pool', 'Gym', 'Restaurant', 'Bar', 'Wi-Fi'],
      category: 'Design Hotel',
    },
  ];

  // Map centred on Riyadh
  const DEFAULT_CENTER = [24.7136, 46.6753];
  const DEFAULT_ZOOM   = 12;

  const priceTierLabel = { budget: '$', mid: '$$', luxury: '$$$' };

  function formatPrice(n) {
    return '$' + Number(n).toLocaleString('en-US');
  }

  function filterHotels({ price = 'all', rating = 'all' } = {}) {
    return HOTELS.filter(h => {
      const priceOk  = price  === 'all' || h.priceTier === price;
      const ratingOk = rating === 'all' || h.rating >= parseFloat(rating);
      return priceOk && ratingOk;
    });
  }

  function getById(id) {
    return HOTELS.find(h => h.id === Number(id)) || null;
  }

  return { HOTELS, DEFAULT_CENTER, DEFAULT_ZOOM, priceTierLabel, formatPrice, filterHotels, getById };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 2 – HotelMap
   ═══════════════════════════════════════════════════════════════ */
const HotelMap = (() => {
  let _map        = null;
  let _tileLayer  = null;
  let _userMarker = null;

  const TILES = {
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };
  const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  function init() {
    if (_map) return _map;

    _map = L.map('hotel-map', {
      center:           HotelData.DEFAULT_CENTER,
      zoom:             HotelData.DEFAULT_ZOOM,
      zoomControl:      false,
      attributionControl: true,
    });

    _applyTiles(_currentTheme());
    _map.attributionControl.setPrefix(false);
    return _map;
  }

  function _currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function _applyTiles(theme) {
    if (!_map) return;
    if (_tileLayer) { _map.removeLayer(_tileLayer); _tileLayer = null; }
    _tileLayer = L.tileLayer(TILES[theme] || TILES.light, {
      attribution: ATTRIBUTION,
      maxZoom:     19,
      subdomains:  'abcd',
    }).addTo(_map);
  }

  function switchTheme(theme) { _applyTiles(theme); }

  function setView(lat, lng, zoom = 14) {
    if (_map) _map.flyTo([lat, lng], zoom, { duration: 1, easeLinearity: 0.3 });
  }

  function invalidate() {
    if (_map) _map.invalidateSize();
  }

  function showUserLocation(lat, lng) {
    if (!_map) return;
    if (_userMarker) _map.removeLayer(_userMarker);

    const icon = L.divIcon({
      className: '',
      html: '<div class="user-location-marker"></div>',
      iconSize:   [18, 18],
      iconAnchor: [9, 9],
    });
    _userMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 })
      .addTo(_map)
      .bindTooltip('You are here', { permanent: false, direction: 'top', offset: [0, -12] });

    setView(lat, lng, 14);
  }

  function getMap()  { return _map; }
  function zoomIn()  { if (_map) _map.zoomIn(); }
  function zoomOut() { if (_map) _map.zoomOut(); }

  return { init, switchTheme, setView, invalidate, showUserLocation, getMap, zoomIn, zoomOut };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 3 – HotelMarkers
   Custom L.divIcon price-tag pins matching the UI style
   ═══════════════════════════════════════════════════════════════ */
const HotelMarkers = (() => {
  const _markers = new Map(); // id → L.Marker
  let _activeId  = null;
  let _onClickCb = null;

  /*
   * Price-tag pin:
   *   [ $320 ]
   *      ▼
   * White pill with dark border in light mode,
   * flips to primary red when active/hovered.
   */
  function _makeIcon(hotel) {
    const price = HotelData.formatPrice(hotel.pricePerNight);
    const tier  = HotelData.priceTierLabel[hotel.priceTier] || '$';

    // icon-size [0,0] + iconAnchor bottom-centre so the pin tip points to the location
    return L.divIcon({
      className:  '',
      html: `
        <div class="hmap-pin" data-id="${hotel.id}">
          <span class="hmap-pin-price">${price}</span>
        </div>
        <div class="hmap-pin-tail"></div>
      `,
      iconSize:   [0, 0],
      iconAnchor: [0, 0],
    });
  }

  function renderAll(hotels, map, onClickCb) {
    _onClickCb = onClickCb;
    _clearAll(map);

    hotels.forEach(hotel => {
      const marker = L.marker([hotel.lat, hotel.lng], {
        icon:          _makeIcon(hotel),
        zIndexOffset:  100,
      }).addTo(map);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActive(hotel.id);
        if (_onClickCb) _onClickCb(hotel.id);
      });

      _markers.set(hotel.id, marker);
    });
  }

  function _getPin(id) {
    const m = _markers.get(id);
    return m ? m.getElement()?.querySelector('.hmap-pin') : null;
  }

  function setActive(id) {
    // Deactivate previous
    if (_activeId != null) {
      const prev = _getPin(_activeId);
      if (prev) prev.classList.remove('active');
      const pm = _markers.get(_activeId);
      if (pm) pm.setZIndexOffset(100);
    }

    _activeId = id;

    if (id != null) {
      const pin = _getPin(id);
      if (pin) pin.classList.add('active');
      const m = _markers.get(id);
      if (m) m.setZIndexOffset(9999);
    }
  }

  function clearActive() { setActive(null); }

  function _clearAll(map) {
    _markers.forEach(m => map.removeLayer(m));
    _markers.clear();
    _activeId = null;
  }

  function panTo(id, map) {
    const m = _markers.get(id);
    if (m && map) {
      map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 13), { duration: 0.7 });
    }
  }

  return { renderAll, setActive, clearActive, panTo };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 4 – HotelList   (sidebar cards)
   ═══════════════════════════════════════════════════════════════ */
const HotelList = (() => {
  let _activeId  = null;
  let _onClickCb = null;

  function render(hotels, onClickCb) {
    _onClickCb = onClickCb;
    const list    = document.getElementById('hotel-list');
    const countEl = document.getElementById('results-number');
    if (!list) return;

    list.innerHTML = '';
    if (countEl) countEl.textContent = hotels.length;

    if (!hotels.length) {
      list.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--text-secondary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round"
               style="margin:0 auto 1rem;display:block;opacity:.4;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <strong style="display:block;color:var(--text-primary);margin-bottom:.25rem;">No hotels found</strong>
          Try adjusting your filters.
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    hotels.forEach((h, i) => frag.appendChild(_card(h, i)));
    list.appendChild(frag);
  }

  function _card(hotel, index) {
    const el = document.createElement('div');
    el.className = 'hotel-list-card';
    el.setAttribute('role', 'listitem');
    el.dataset.id = hotel.id;
    el.style.animationDelay = `${index * 0.04}s`;

    el.innerHTML = `
      <div class="hotel-list-thumb">
        <img src="${hotel.image}" alt="${hotel.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&q=60'">
      </div>
      <div class="hotel-list-body">
        <div class="hotel-list-name" title="${hotel.name}">${hotel.name}</div>
        <div class="hotel-list-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${hotel.location}
        </div>
        <div class="hotel-list-footer">
          <div class="hotel-list-rating">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                 fill="currentColor" stroke="currentColor" stroke-width="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            ${hotel.rating}
            <span style="font-weight:400;color:var(--text-secondary);">(${hotel.reviews})</span>
          </div>
          <div class="hotel-list-price">${HotelData.formatPrice(hotel.pricePerNight)}/night</div>
        </div>
      </div>`;

    el.addEventListener('click', () => {
      setActive(hotel.id);
      if (_onClickCb) _onClickCb(hotel.id);
    });

    return el;
  }

  function setActive(id) {
    if (_activeId != null) {
      const prev = document.querySelector(`.hotel-list-card[data-id="${_activeId}"]`);
      if (prev) prev.classList.remove('active');
    }
    _activeId = id;
    if (id != null) {
      const el = document.querySelector(`.hotel-list-card[data-id="${id}"]`);
      if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    }
  }

  function clearActive() { setActive(null); }

  return { render, setActive, clearActive };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 5 – HotelPanel  (slide-in detail panel)
   All DOM references are LAZY — grabbed only when needed,
   never at module parse time.
   ═══════════════════════════════════════════════════════════════ */
const HotelPanel = (() => {
  let _isOpen = false;

  const $ = id => document.getElementById(id);

  function wireClose() {
    const closeBtn = $('panel-close-btn');
    const backdrop = $('panel-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
  }

  function open(hotelId) {
    const hotel = HotelData.getById(hotelId);
    const panel = $('hotel-detail-panel');
    if (!hotel || !panel) return;

    _fill(hotel);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    const bd = $('panel-backdrop');
    if (bd) bd.classList.add('visible');
    _isOpen = true;
  }

  function close() {
    const panel = $('hotel-detail-panel');
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    const bd = $('panel-backdrop');
    if (bd) bd.classList.remove('visible');
    _isOpen = false;
  }

  function _fill(hotel) {
    const content = $('panel-content');
    if (!content) return;

    const tier = HotelData.priceTierLabel[hotel.priceTier] || '$';
    const amenities = hotel.amenities.map(a =>
      `<div class="panel-amenity">
         <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
           <polyline points="20 6 9 17 4 12"/>
         </svg>${a}
       </div>`
    ).join('');

    content.innerHTML = `
      <img class="panel-hero" src="${hotel.image}" alt="${hotel.name}"
           onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=70'">
      <div class="panel-body">
        <div class="panel-category">${hotel.category}</div>
        <h2 class="panel-name">${hotel.name}</h2>
        <div class="panel-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>${hotel.location}
        </div>

        <div class="panel-rating-row">
          <div class="panel-rating-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                 fill="currentColor" stroke="currentColor" stroke-width="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>${hotel.rating}
          </div>
          <div class="panel-reviews">${hotel.reviews.toLocaleString()} reviews</div>
        </div>

        <div class="panel-price-row">
          <div class="panel-price">${HotelData.formatPrice(hotel.pricePerNight)} <span>/ night</span></div>
          <div class="panel-price-tier">${tier}</div>
        </div>

        <p class="panel-description">${hotel.description}</p>

        <div class="panel-amenities">${amenities}</div>

        <div class="panel-cta-row">
          <a href="place.html" class="panel-btn-primary">View Full Details</a>
          <button class="panel-btn-secondary" id="panel-save-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>Save
          </button>
        </div>
      </div>`;

    const saveBtn = $('panel-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const saved = saveBtn.dataset.saved === 'true';
        saveBtn.dataset.saved = String(!saved);
        const ico = saveBtn.querySelector('svg');
        if (ico) { ico.setAttribute('fill', saved ? 'none' : '#FF385C'); ico.setAttribute('stroke', saved ? 'currentColor' : '#FF385C'); }
      });
    }
  }

  return { wireClose, open, close, isOpen: () => _isOpen };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 6 – UIControls
   ═══════════════════════════════════════════════════════════════ */
const UIControls = (() => {

  const CITIES = [
    { name: 'Riyadh, Saudi Arabia',  lat: 24.7136,  lng: 46.6753  },
    { name: 'Jeddah, Saudi Arabia',  lat: 21.4858,  lng: 39.1925  },
    { name: 'Mecca, Saudi Arabia',   lat: 21.3891,  lng: 39.8579  },
    { name: 'Medina, Saudi Arabia',  lat: 24.5247,  lng: 39.5692  },
    { name: 'Dubai, UAE',            lat: 25.2048,  lng: 55.2708  },
    { name: 'New York, USA',         lat: 40.7484,  lng: -73.9848 },
    { name: 'Paris, France',         lat: 48.8566,  lng: 2.3522   },
    { name: 'London, UK',            lat: 51.5074,  lng: -0.1278  },
  ];

  let _filterState   = { price: 'all', rating: 'all' };
  let _onFilter      = null;
  let _onLocationPick = null;

  function initSearch(cb) {
    _onLocationPick = cb;
    const input    = document.getElementById('map-search-input');
    const dropdown = document.getElementById('search-dropdown');
    const clearBtn = document.getElementById('search-clear-btn');
    if (!input) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
      if (!q) { dropdown.classList.remove('open'); return; }

      const hits = CITIES.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5);
      _showDropdown(hits, dropdown, input);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length) dropdown.classList.add('open');
    });

    document.addEventListener('click', e => {
      if (!input.closest('.map-search-wrap').contains(e.target))
        dropdown.classList.remove('open');
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        dropdown.classList.remove('open');
        input.focus();
      });
    }
  }

  function _showDropdown(cities, dropdown, input) {
    dropdown.innerHTML = '';
    if (!cities.length) { dropdown.classList.remove('open'); return; }

    cities.forEach(c => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      li.innerHTML = `
        <div class="dropdown-item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="dropdown-item-text">
          <strong>${c.name}</strong><span>City</span>
        </div>`;
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        input.value = c.name;
        dropdown.classList.remove('open');
        if (document.getElementById('search-clear-btn'))
          document.getElementById('search-clear-btn').style.display = 'flex';
        if (_onLocationPick) _onLocationPick(c.lat, c.lng, c.name);
      });
      dropdown.appendChild(li);
    });

    dropdown.classList.add('open');
  }

  function initFilters(cb) {
    _onFilter = cb;
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const type  = btn.dataset.filter;
        const value = btn.dataset.value;
        document.querySelectorAll(`.filter-chip[data-filter="${type}"]`)
          .forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        _filterState[type] = value;
        if (_onFilter) _onFilter({ ..._filterState });
      });
    });
  }

  function showToast(msg, ms = 2500) {
    const t = document.getElementById('map-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), ms);
  }

  return { initSearch, initFilters, showToast };
})();


/* ═══════════════════════════════════════════════════════════════
   MODULE 7 – MapApp  (Orchestrator)
   ═══════════════════════════════════════════════════════════════ */
const MapApp = (() => {
  let _map     = null;
  let _hotels  = [];

  function init() {
    // 1. Theme
    const theme = localStorage.getItem('hbnb-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    _syncThemeIcons(theme);

    // 2. Map
    _map = HotelMap.init();

    // 3. Invalidate size after first paint (fixes blank/grey tiles)
    setTimeout(() => HotelMap.invalidate(), 100);

    // 4. Panel close wiring (DOM is ready now)
    HotelPanel.wireClose();

    // 5. Load hotels
    _hotels = HotelData.filterHotels();
    HotelList.render(_hotels, _listClick);
    HotelMarkers.renderAll(_hotels, _map, _markerClick);

    // 6. Remove spinner
    const spinner = document.getElementById('list-loading');
    if (spinner) spinner.remove();

    // 7. UI controls
    UIControls.initSearch((lat, lng, name) => {
      HotelMap.setView(lat, lng, 13);
      UIControls.showToast('Showing hotels near ' + name);
    });

    UIControls.initFilters(filters => {
      _hotels = HotelData.filterHotels(filters);
      HotelList.render(_hotels, _listClick);
      HotelMarkers.renderAll(_hotels, _map, _markerClick);
      HotelPanel.close();
      UIControls.showToast(`${_hotels.length} hotel${_hotels.length !== 1 ? 's' : ''} found`);
    });

    // 8. Custom zoom buttons
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => HotelMap.zoomIn());
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => HotelMap.zoomOut());
    document.getElementById('locate-me-btn')?.addEventListener('click', _locate);

    // 9. Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const cur  = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('hbnb-theme', next);
      HotelMap.switchTheme(next);
      _syncThemeIcons(next);
    });

    // 10. Map click → close panel
    _map.on('click', () => {
      HotelPanel.close();
      HotelMarkers.clearActive();
      HotelList.clearActive();
    });

    // 11. Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && HotelPanel.isOpen()) {
        HotelPanel.close();
        HotelMarkers.clearActive();
        HotelList.clearActive();
      }
    });
  }

  function _markerClick(id) {
    HotelList.setActive(id);
    HotelPanel.open(id);
    HotelMarkers.panTo(id, _map);
  }

  function _listClick(id) {
    HotelMarkers.setActive(id);
    HotelPanel.open(id);
    HotelMarkers.panTo(id, _map);
  }

  function _locate() {
    if (!navigator.geolocation) { UIControls.showToast('Geolocation not supported'); return; }
    UIControls.showToast('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      pos => { HotelMap.showUserLocation(pos.coords.latitude, pos.coords.longitude); UIControls.showToast('Showing hotels near you!'); },
      ()  => UIControls.showToast('Could not access location'),
      { timeout: 8000 }
    );
  }

  function _syncThemeIcons(theme) {
    const moon = document.getElementById('icon-moon');
    const sun  = document.getElementById('icon-sun');
    if (moon) moon.style.display = theme === 'dark' ? 'none'  : 'block';
    if (sun)  sun.style.display  = theme === 'dark' ? 'block' : 'none';
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   BOOT – only runs on the map page
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hotel-map')) {
    MapApp.init();
  }
});
