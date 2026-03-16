import { translations, Lang } from './translations';

// Client component: read lang from document.cookie
export function getCookieLang(): Lang {
  if (typeof document === 'undefined') return 'id';
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  return match?.[1] === 'en' ? 'en' : 'id';
}

export { translations };
export type { Lang };
