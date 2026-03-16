'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
      ${status === 'approved' ? 'bg-green-100 text-green-700' :
        status === 'rejected' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'}`}>
      {status}
    </span>
  );
}

export default function ReviewsTable({ reviews }: { reviews: any[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<number | null>(null);

  const handleStatus = async (id: number, status: 'approved' | 'rejected') => {
    setLoading(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewed_by: session?.user?.id }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Review ${status}`);
      router.refresh();
    } catch {
      toast.error('Gagal update review');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus review ini?')) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Review dihapus');
      router.refresh();
    } catch {
      toast.error('Gagal hapus review');
    } finally {
      setLoading(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400">Tidak ada review ditemukan</p>
      </div>
    );
  }

  return (
    <>
      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Reviewer', 'Place', 'Rating', 'Komentar', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Aksi' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm text-gray-900">{review.user_name}</p>
                    <p className="text-xs text-gray-400">{review.user_email || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{review.place_name || `#${review.place_id}`}</td>
                  <td className="px-6 py-4 text-yellow-500">{'⭐'.repeat(review.rating)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <p className="truncate">{review.comment || '—'}</p>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={review.status} /></td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {review.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatus(review.id, 'approved')} disabled={loading === review.id}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleStatus(review.id, 'rejected')} disabled={loading === review.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Reject">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(review.id)} disabled={loading === review.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="md:hidden space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{review.user_name}</p>
                {review.user_email && (
                  <p className="text-xs text-gray-400">{review.user_email}</p>
                )}
              </div>
              <StatusBadge status={review.status} />
            </div>

            {/* Place & rating */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 text-xs">📍 {review.place_name || `Place #${review.place_id}`}</span>
              <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                "{review.comment}"
              </p>
            )}

            {/* Date + Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              <div className="flex gap-2">
                {review.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(review.id, 'approved')} disabled={loading === review.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-all disabled:opacity-50">
                      <Check size={13} /> Approve
                    </button>
                    <button onClick={() => handleStatus(review.id, 'rejected')} disabled={loading === review.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-all disabled:opacity-50">
                      <X size={13} /> Reject
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(review.id)} disabled={loading === review.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
