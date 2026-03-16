'use client';

import { useState } from 'react';

const REASONS = [
  { value: 'info_salah',        label: '📝 Informasi salah / tidak akurat' },
  { value: 'foto_tidak_sesuai', label: '🖼️ Foto tidak sesuai' },
  { value: 'tempat_tutup',      label: '🚫 Tempat sudah tutup / tidak ada' },
  { value: 'lainnya',           label: '💬 Lainnya' },
];

interface Props {
  placeId: number;
  placeName: string;
}

export default function ReportButton({ placeId, placeName }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function openModal() {
    setOpen(true);
    setSent(false);
    setError('');
    setReason('');
    setDescription('');
    setReporterName('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return setError('Pilih alasan laporan dulu ya!');

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          place_name: placeName,
          reason,
          description: description.trim() || undefined,
          reporter_name: reporterName.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal mengirim laporan.');
      }
    } catch {
      setError('Gagal mengirim laporan. Coba lagi ya!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="flex items-center gap-1.5 font-cute text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        🚩 Laporkan kesalahan
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl border-4 border-black overflow-hidden"
            style={{ boxShadow: '8px 8px 0px #2C3E50' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-accent-yellow">
              <h2 className="font-display text-xl text-text-dark">🚩 Laporkan Kesalahan</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-text-dark hover:text-red-500 text-2xl font-bold leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {sent ? (
                <div className="text-center py-6 space-y-3">
                  <div className="text-5xl">✅</div>
                  <p className="font-display text-xl text-text-dark">Laporan terkirim!</p>
                  <p className="font-cute text-gray-500 text-sm">
                    Terima kasih, kami akan segera meninjau laporan kamu.
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-2 px-6 py-2 bg-black text-white font-cute rounded-full border-2 border-black hover:bg-gray-800 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="font-cute text-sm text-gray-500">
                    Melaporkan: <span className="font-semibold text-text-dark">{placeName}</span>
                  </p>

                  {/* Reason */}
                  <div>
                    <label className="block font-cute font-semibold text-sm text-text-dark mb-2">
                      Alasan laporan *
                    </label>
                    <div className="space-y-2">
                      {REASONS.map((r) => (
                        <label
                          key={r.value}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all font-cute text-sm
                            ${reason === r.value
                              ? 'border-black bg-accent-yellow font-semibold'
                              : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={r.value}
                            checked={reason === r.value}
                            onChange={() => setReason(r.value)}
                            className="accent-black"
                          />
                          {r.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-cute font-semibold text-sm text-text-dark mb-1">
                      Keterangan tambahan <span className="text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Ceritakan lebih detail masalahnya..."
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-cute text-sm resize-none focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-xs text-gray-400 text-right mt-0.5">{description.length}/500</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block font-cute font-semibold text-sm text-text-dark mb-1">
                      Nama kamu <span className="text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      maxLength={60}
                      placeholder="Nama kamu..."
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-cute text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {error && (
                    <p className="font-cute text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 py-2.5 font-cute font-semibold rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-red-500 text-white font-cute font-semibold rounded-full border-2 border-red-700 hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                    >
                      {loading ? 'Mengirim...' : '🚩 Kirim Laporan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
