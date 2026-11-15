const STORAGE_KEY = 'vizzu-signup-device-id-v1';

export const getSignupDeviceId = () => {
  if (typeof window === 'undefined' || !window.crypto?.randomUUID) return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = window.crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return window.crypto.randomUUID();
  }
};
