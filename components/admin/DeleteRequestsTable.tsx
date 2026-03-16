'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteRequest {
  id: number;
  place_id: number;
  place_name: string;
  place_category: string;
  requested_by_name: string;
  reason?: string;
  status: string;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  makanan: '🍔', pantai: '🏖️', taman: '🌳', shopping: '🛍️', wisata: '🎡',
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      <Clock size={10} /> Menunggu
    </span>
  );
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle size={10} /> Disetujui
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <XCircle size={10} /> Ditolak
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function DeleteRequestsTable({
  requests,
  readOnly = false,
}: {
  requests: DeleteRequest[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState<number | null>(null);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!confirm(`Yakin ingin ${label} permintaan hapus ini?`)) return;

    setProcessing(id);
    try {
      const res = await fetch(`/api/delete-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');

      toast.success(action === 'approve' ? 'Permintaan disetujui. Place telah dihapus.' : 'Permintaan ditolak.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setProcessing(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Place</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Diminta oleh</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Alasan</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Waktu</th>
                {!readOnly && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Status</th>}
                {readOnly && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Status</th>}
                {!readOnly && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_EMOJI[req.place_category] ?? '📍'}</span>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{req.place_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{req.place_category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <User size={13} className="text-gray-400" />
                      {req.requested_by_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 max-w-xs">
                      {req.reason || <span className="text-gray-400 italic">Tidak ada alasan</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
                    {readOnly && req.reviewer_name && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Ditinjau oleh {req.reviewer_name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'approve')}
                          disabled={processing === req.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Setujui
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'reject')}
                          disabled={processing === req.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                        >
                          <XCircle size={13} /> Tolak
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{CATEGORY_EMOJI[req.place_category] ?? '📍'}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{req.place_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{req.place_category}</p>
                </div>
              </div>
              <StatusBadge status={req.status} />
            </div>

            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <User size={11} /> {req.requested_by_name}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={11} /> {formatDate(req.created_at)}
              </div>
              {req.reason && (
                <p className="text-gray-600 mt-1">{req.reason}</p>
              )}
            </div>

            {!readOnly && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  disabled={processing === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                >
                  <CheckCircle size={13} /> Setujui
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
                  disabled={processing === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                >
                  <XCircle size={13} /> Tolak
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
