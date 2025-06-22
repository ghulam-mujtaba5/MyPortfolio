// utils/cookieConsent.js
export function hasAcceptedCookies() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('cookie_consent') === 'true';
  } catch {
    return false;
  }
}

export function hasDeclinedCookies() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('cookie_consent') === 'declined';
  } catch {
    return false;
  }
}
