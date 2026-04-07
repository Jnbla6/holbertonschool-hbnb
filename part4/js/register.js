import { $ } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggle();

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
});
