'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Flag, ExternalLink, CheckCheck, Eye, RefreshCw } from 'lucide-react';

type Report = {
  id: number;
  place_id: number;
  place_name: string;
  reason: string;
  description: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  reviewed_at: string | null;
};

const REASON_LABELS: Record<string, string> = {
  info_salah:        '📝 Informasi salah',
  foto_tidak_sesuai: '🖼️ Foto tidak sesuai',
  tempat_tutup:      '🚫 Tempat sudah tutup',
  lainnya:           '💬 Lainnya',
};

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800 border-yellow-300',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
};

const STATUS_LABELS: Record<string, string> = {
  pending:  'Menunggu',
  reviewed: 'Ditinjau',
  resolved: 'Selesai',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function updateStatus(id: number, status: 'reviewed' | 'resolved') {
    setUpdating(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch {}
    setUpdating(null);
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const counts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flag size={24} className="text-red-500" />
            Laporan Kesalahan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Laporan dari pengguna tentang kesalahan data tempat
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all
              ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-400'}`}
          >
            {s === 'all' ? 'Semua' : STATUS_LABELS[s]}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === s ? 'bg-white/20' : 'bg-gray-100'}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Memuat laporan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-500 font-medium">Tidak ada laporan di sini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className={`bg-white border-2 rounded-2xl p-5 transition-all
                ${report.status === 'pending' ? 'border-yellow-300' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Place + status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/places`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {report.place_name}
                    </Link>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[report.status]}`}>
                      {STATUS_LABELS[report.status]}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-sm font-medium text-gray-700">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </p>

                  {/* Description */}
                  {report.description && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                      &ldquo;{report.description}&rdquo;
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    {report.reporter_name && (
                      <span>👤 {report.reporter_name}</span>
                    )}
                    <span>
                      🕐 {new Date(report.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="text-gray-300">#{report.id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {report.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(report.id, 'reviewed')}
                      disabled={updating === report.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Eye size={13} />
                      Tandai Ditinjau
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      disabled={updating === report.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCheck size={13} />
                      Selesaikan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
