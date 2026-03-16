'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LayoutList, Map } from 'lucide-react';
import PlacesTable from './PlacesTable';

// Leaflet tidak support SSR
const PlacesMap = dynamic(() => import('./PlacesMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[560px] bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Memuat peta...</p>
      </div>
    </div>
  ),
});

type View = 'table' | 'map';

export default function PlacesViewToggle({ places, role }: { places: any[]; role?: string }) {
  const [view, setView] = useState<View>('table');

  return (
    <>
      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setView('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'table'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutList size={15} />
          Tabel
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Map size={15} />
          Peta
        </button>
      </div>

      {view === 'table' && <PlacesTable places={places} role={role} />}
      {view === 'map'   && <PlacesMap places={places} />}
    </>
  );
}
