import { cookies } from 'next/headers';
import { translations, Lang } from './translations';

// Server component only: read lang from cookie
export async function getLang(): Promise<Lang> {
  const c = await cookies();
  const val = c.get('lang')?.value;
  return val === 'en' ? 'en' : 'id';
}

export { translations };
export type { Lang };
