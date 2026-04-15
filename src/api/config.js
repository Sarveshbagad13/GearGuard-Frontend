/**
 * ⚠️  DEPRECATED — This file is no longer used.
 *
 * All API calls in this project go through:
 *   src/services/api.js
 *
 * This axios instance was a legacy layer that no page component ever imported.
 * It is kept here only to avoid breaking any potential future imports, but
 * nothing in src/Pages/ or src/components/ uses it.
 *
 * Do NOT add new functionality here. Use src/services/api.js instead.
 */

// Re-export the central service so any accidental import still works.
export { default } from '../services/api';