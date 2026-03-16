import { redirect } from 'next/navigation';
import { queries } from '@/lib/db';
import { getLang, translations } from '@/lib/i18n/server';
import SearchResultsWindow from '@/components/SearchResultsWindow';

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const lang = await getLang();
  const t = translations[lang].search;
  const q = searchParams.q?.trim();
  if (!q) redirect('/');

  const places = await queries.places.getAll({
    status: 'published',
    search: q,
  });

  return (
    <SearchResultsWindow
      initialQuery={q}
      places={places}
      foundText={t.found(places.length, q)}
      emptyText={t.empty}
      emptySubText={t.emptySub}
      backHomeText={t.backHome}
    />
  );
}
