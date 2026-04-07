export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function getCookie(name) {
  return document.cookie.split('; ')
    .find(r => r.startsWith(name + '='))
    ?.split('=')[1] || null;
}
