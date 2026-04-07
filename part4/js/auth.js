import { getCookie } from './utils.js';

export function isLoggedIn() {
  return getCookie('token') !== null;
}

export function checkAuthentication(onAuthSuccess) {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  const accountMenu = document.getElementById('account-menu');
  const addPlaceLink = document.getElementById('add-place-link');

  const isOwner = localStorage.getItem('is_owner') === 'true';

  if (!token) {
    if (loginLink) loginLink.style.display = 'block';
    if (accountMenu) accountMenu.style.display = 'none';
    if (addPlaceLink) addPlaceLink.style.display = 'none';
  } else {
    if (loginLink) loginLink.style.display = 'none';
    if (accountMenu) accountMenu.style.display = 'block';
    
    if (isOwner && addPlaceLink) {
      addPlaceLink.style.display = 'block';
    } else if (addPlaceLink) {
      addPlaceLink.style.display = 'none';
    }

    const adminLink = document.getElementById('admin-link');
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (adminLink) {
      adminLink.style.display = isAdmin ? 'block' : 'none';
    }
  }
  
  if (onAuthSuccess) onAuthSuccess(token);
}

export function initAccountMenu() {
  const accountBtn = document.getElementById('account-btn');
  const accountDropdown = document.getElementById('account-dropdown');
  const logoutLink = document.getElementById('logout-link');
  const becomeOwnerLink = document.getElementById('become-owner-link');
  const switchTravelerLink = document.getElementById('switch-traveler-link');

  const isOwner = localStorage.getItem('is_owner') === 'true';

  if (becomeOwnerLink && switchTravelerLink) {
    if (isOwner) {
      becomeOwnerLink.style.display = 'none';
      switchTravelerLink.style.display = 'block';
    } else {
      becomeOwnerLink.style.display = 'block';
      switchTravelerLink.style.display = 'none';
    }

    becomeOwnerLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('is_owner', 'true');
      window.location.reload();
    });

    switchTravelerLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('is_owner');
      window.location.reload();
    });
  }

  if (accountBtn && accountDropdown) {
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = accountDropdown.style.display === 'block';
      accountDropdown.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!accountDropdown.contains(e.target) && !accountBtn.contains(e.target)) {
        accountDropdown.style.display = 'none';
      }
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.cookie = 'token=; Max-Age=0; path=/';
      localStorage.removeItem('is_admin');
      localStorage.removeItem('is_owner');
      window.location.reload();
    });
  }
}
