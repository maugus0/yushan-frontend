// Minimal token helper used by request.js and tests.
// Keeps behavior simple and safe for JSDOM tests.
export function getToken() {
  try {
    // common storage key used in app; return null if not set
    return typeof localStorage !== 'undefined' ? localStorage.getItem('auth.token') : null;
  } catch (e) {
    return null;
  }
}
