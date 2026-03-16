

# Fix: Sidebar dark mode text visibility

## Problem
The sidebar uses CSS variables `--primary-950` and `--primary-900` for its dark mode gradient. However, in the dark theme definition in `index.css`, these values are **inverted** — `--primary-950` has 98% lightness (nearly white) and `--primary-50` has 10% lightness (very dark). This means the sidebar background becomes near-white in dark mode, making all the white text (`dark:text-white`, `dark:text-white/60`) invisible.

## Fix

### `src/components/Sidebar.tsx` — Line 163
Replace the HSL variable references with hardcoded hex values that are guaranteed to be dark:

**Before:** `dark:from-[hsl(var(--primary-950))] dark:to-[hsl(var(--primary-900))]`
**After:** `dark:from-[#0F2F6B] dark:to-[#1A3A7A]`

This uses the VIZZU Dark (#0F2F6B) and a slightly lighter navy (#1A3A7A), ensuring the sidebar stays dark and all white text remains legible.

Single line change, one file.

