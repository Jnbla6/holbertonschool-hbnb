/* global localStorage, alert, confirm, fetch, document, window, FormData */

import { verifySession, getCsrfToken } from './auth.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';
import { $, escapeHTML } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. init theme and auth
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();

  // 2. check admin privileges
  const sessionData = await verifySession();
  if (!sessionData || !sessionData.is_admin) {
      alert('Access denied. Admin privileges required.');
      window.location.href = 'index.html';
      return;
  }

  const API = 'http://127.0.0.1:8080/api/v1';

  // 3. set up headers
  const headers = { 'X-CSRF-TOKEN': getCsrfToken() };

  // ======= LOAD STATS =======
  async function loadStats () {
    try {
      const [usersRes, placesRes, amenitiesRes, reviewsRes] = await Promise.all([
        fetch(`${API}/users/`),
        fetch(`${API}/places/`),
        fetch(`${API}/amenities/`),
        fetch(`${API}/reviews/`)
      ]);
      document.getElementById('stat-users').textContent = (await usersRes.json()).length;
      document.getElementById('stat-places').textContent = (await placesRes.json()).length;
      document.getElementById('stat-amenities').textContent = (await amenitiesRes.json()).length;
      document.getElementById('stat-reviews').textContent = (await reviewsRes.json()).length;
    } catch (e) { console.error('Failed to load stats:', e); }
  }

  // ======= LOAD USERS =======
  async function loadUsers () {
    const currentUserId = sessionData ? sessionData.user_id : null;

    try {
      const res = await fetch(`${API}/users/`);
      const users = await res.json();
      const tbody = document.getElementById('admin-users-table');
      tbody.innerHTML = '';

      users.forEach(user => {
        const tr = document.createElement('tr');
        const isAdmin = user.is_admin;
        const isSelf = String(user.id) === String(currentUserId);
        tr.innerHTML = `
                    <td><strong>${escapeHTML(user.first_name)} ${escapeHTML(user.last_name)}</strong>${isSelf ? ' <span style="font-size:0.72rem; color:var(--primary); font-weight:600;">(You)</span>' : ''}</td>
                    <td>${escapeHTML(user.email)}</td>
                    <td><span class="${isAdmin ? 'badge-admin' : 'badge-user'}">${isAdmin ? 'Admin' : 'User'}</span></td>
                    <td>
                        <div class="btn-actions">
                            ${isSelf
? ''
: `<button class="btn-sm ${isAdmin ? 'btn-demote' : 'btn-promote'}" data-toggle-id="${user.id}">
                                ${isAdmin ? 'Demote' : 'Promote'}
                            </button>
                            <button class="btn-sm btn-delete" data-delete-id="${user.id}" data-name="${escapeHTML(user.first_name)} ${escapeHTML(user.last_name)}">Delete</button>`}
                        </div>
                    </td>
                `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('[data-toggle-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.toggleId;
          const res = await fetch(`${API}/users/${userId}/toggle-admin`, {
            method: 'PUT',
            credentials: 'include',
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
          if (res.ok) { loadUsers(); loadStats(); } else { alert((await res.json()).error || 'Failed'); }
        });
      });

      // Delete user
      tbody.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name;
          if (!confirm(`Delete user "${name}"? All their places and reviews will also be removed.`)) return;
          const res = await fetch(`${API}/users/${btn.dataset.deleteId}`, { method: 'DELETE', credentials: 'include', headers });
          if (res.ok) { loadUsers(); loadStats(); } else { alert((await res.json()).error || 'Failed to delete user'); }
        });
      });
    } catch (e) { console.error(e); }
  }

  // ======= LOAD AMENITIES =======
  async function loadAmenities () {
    try {
      const res = await fetch(`${API}/amenities/`);
      const amenities = await res.json();
      const container = document.getElementById('amenity-list');
      container.innerHTML = '';

      amenities.forEach(am => {
        const tag = document.createElement('div');
        tag.className = 'amenity-tag';

        const isImageFile = am.icon && (am.icon.includes('/') || am.icon.includes('.'));
        const iconHtml = isImageFile
          ? `<img src="${am.icon}" alt="icon" style="width: 1.2rem; height: 1.2rem; object-fit: contain;">`
          : `<span style="font-size:1.1rem;">${am.icon || '✓'}</span>`;

        tag.innerHTML = `${iconHtml} <span>${escapeHTML(am.name)}</span><button class="delete-amenity" data-id="${am.id}" title="Delete">&times;</button>`;
        container.appendChild(tag);
      });

      if (!amenities.length) {
        container.innerHTML = '<span style="color:var(--text-secondary)">No amenities yet. Add one above!</span>';
      }

      // Delete amenity
      container.querySelectorAll('.delete-amenity').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this amenity?')) return;
          const res = await fetch(`${API}/amenities/${btn.dataset.id}`, { method: 'DELETE', credentials: 'include', headers });
          if (res.ok) { loadAmenities(); loadStats(); } else { alert('Failed to delete amenity'); }
        });
      });
    } catch (e) { console.error(e); }
  }

  // ======= ADD AMENITY =======
  document.getElementById('add-amenity-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('new-amenity-icon');
    const nameInput = document.getElementById('new-amenity-name');

    const name = nameInput.value.trim();
    const file = fileInput.files[0];

    if (!name) {
      alert('Amenity name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('image_file', file);
    }

    try {
      const res = await fetch(`${API}/amenities/`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      });

      if (res.ok) {
        nameInput.value = '';
        fileInput.value = '';
        loadAmenities();
        loadStats();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add amenity');
      }
    } catch (e) { alert('Network error'); }
  });

  // Init
  loadStats();
  loadUsers();
  loadAmenities();
});
