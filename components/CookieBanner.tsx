'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = (type: 'all' | 'essential') => {
    localStorage.setItem('cookie-consent', type);
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="max-w-2xl mx-auto bg-white border-2 border-gray-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="flex-shrink-0 w-9 h-9 bg-amber-400 border-2 border-gray-900 rounded-xl flex items-center justify-center">
            <Cookie size={18} className="text-gray-900" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-900">Website ini menggunakan Cookie 🍪</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Kami pakai cookie untuk pengalaman browsing yang lebih baik.
            </p>
          </div>
        </div>

        {/* Detail toggle */}
        {showDetail && (
          <div className="mx-4 mb-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2 border border-gray-200">
            <div>
              <span className="font-semibold text-gray-800">Cookie Esensial</span> — Diperlukan agar website berfungsi (login sesi, keamanan). Tidak bisa dinonaktifkan.
            </div>
            <div>
              <span className="font-semibold text-gray-800">Cookie Analitik</span> — Membantu kami memahami cara pengunjung menggunakan situs (halaman populer, durasi kunjungan).
            </div>
            <div>
              <span className="font-semibold text-gray-800">Cookie Preferensi</span> — Menyimpan pilihan kamu seperti bahasa dan filter kategori.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-4 pt-1">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mr-auto"
          >
            {showDetail ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showDetail ? 'Sembunyikan detail' : 'Lihat detail'}
          </button>

          <button
            onClick={() => accept('essential')}
            className="px-3 py-1.5 text-xs font-medium border-2 border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Esensial saja
          </button>

          <button
            onClick={() => accept('all')}
            className="px-4 py-1.5 text-xs font-bold bg-amber-400 border-2 border-gray-900 text-gray-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Terima Semua
          </button>
        </div>
      </div>
    </div>
  );
}
