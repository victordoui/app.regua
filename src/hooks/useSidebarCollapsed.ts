import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "vizzu:sidebar-collapsed";
export const SIDEBAR_W_EXPANDED = 248;
export const SIDEBAR_W_COLLAPSED = 72;

const listeners = new Set<() => void>();

const readInitial = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
};

let state = readInitial();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => state;
const getServerSnapshot = () => false;

export const setSidebarCollapsed = (next: boolean) => {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
  listeners.forEach((l) => l());
};

export const toggleSidebarCollapsed = () => setSidebarCollapsed(!state);

export const useSidebarCollapsed = () => {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;
    document.documentElement.style.setProperty("--sidebar-w", `${w}px`);
  }, [collapsed]);

  return { collapsed, setCollapsed: setSidebarCollapsed, toggle: toggleSidebarCollapsed };
};
