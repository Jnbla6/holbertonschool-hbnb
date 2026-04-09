import { $ } from './utils.js';

export function updateToggleIcon(theme) {
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

export function initTheme() {
  const saved = localStorage.getItem('hbnb-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateToggleIcon(saved);
}

export function setupThemeToggle() {
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
