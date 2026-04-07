import { $, $$ } from './utils.js';
import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();

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
});
