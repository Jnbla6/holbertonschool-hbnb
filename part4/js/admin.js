import { initTheme, setupThemeToggle } from './theme.js';
import { checkAuthentication, initAccountMenu } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggle();
  checkAuthentication();
  initAccountMenu();
});
