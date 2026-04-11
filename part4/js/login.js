import { $ } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();

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
        credentials: 'include',
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
});
