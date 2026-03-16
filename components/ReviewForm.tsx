'use client';

import { useState } from 'react';

export default function ReviewForm({ placeId }: { placeId: number }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError('Pilih bintang dulu ya!');
    if (!name.trim()) return setError('Nama tidak boleh kosong.');

    setLoading(true);
    setError('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: placeId, user_name: name, rating, comment }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Gagal mengirim ulasan.');
    }
  }

  if (sent) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-4 text-center font-cute">
        <p className="text-green-700 font-semibold">✅ Ulasan terkirim! Menunggu persetujuan admin.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-gray-100 rounded-2xl p-4 space-y-3">
      <h3 className="font-display text-lg text-text-dark">Tulis Ulasan</h3>

      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            {star <= (hovered || rating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Nama kamu"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-cute text-sm focus:outline-none focus:border-primary"
      />

      <textarea
        placeholder="Ceritain pengalamanmu di sini... (opsional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-cute text-sm resize-none focus:outline-none focus:border-primary"
      />

      {error && <p className="font-cute text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white font-cute font-semibold px-5 py-2 rounded-xl border-2 border-black hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}
