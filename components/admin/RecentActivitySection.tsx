'use client';

import { useState } from 'react';
import { X, User, Clock, Server, ArrowRight, Plus, Pencil, Trash2, LogIn, Shield, Activity } from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  created_at: string;
  user_name?: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  create_place:         { label: 'Tambah Place',      color: 'text-green-700',  bg: 'bg-green-100',  icon: <Plus size={14} /> },
  update_place:         { label: 'Edit Place',         color: 'text-blue-700',   bg: 'bg-blue-100',   icon: <Pencil size={14} /> },
  delete_place:         { label: 'Hapus Place',        color: 'text-red-700',    bg: 'bg-red-100',    icon: <Trash2 size={14} /> },
  request_delete_place: { label: 'Minta Hapus Place',  color: 'text-orange-700', bg: 'bg-orange-100', icon: <Trash2 size={14} /> },
  reject_delete_place:  { label: 'Tolak Hapus Place',  color: 'text-gray-700',   bg: 'bg-gray-100',   icon: <Shield size={14} /> },
  update_user:          { label: 'Edit User',          color: 'text-purple-700', bg: 'bg-purple-100', icon: <User size={14} /> },
  delete_user:          { label: 'Hapus User',         color: 'text-red-700',    bg: 'bg-red-100',    icon: <Trash2 size={14} /> },
  login:                { label: 'Login',              color: 'text-gray-700',   bg: 'bg-gray-100',   icon: <LogIn size={14} /> },
  update_status:        { label: 'Ubah Status',        color: 'text-orange-700', bg: 'bg-orange-100', icon: <Shield size={14} /> },
};

function getMeta(action: string) {
  return ACTION_META[action] ?? {
    label: action.replace(/_/g, ' '),
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    icon: <Activity size={14} />,
  };
}

function parseJson(val: any): Record<string, any> | null {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return null; }
}

const SKIP_FIELDS = new Set(['id', 'created_at', 'updated_at', 'password_hash', 'slug']);
const FIELD_LABEL: Record<string, string> = {
  name: 'Nama', category: 'Kategori', subcategory: 'Subkategori',
  location: 'Lokasi', status: 'Status', rating: 'Rating',
  latitude: 'Latitude', longitude: 'Longitude', image_url: 'Gambar',
  short_description: 'Deskripsi Singkat', full_description: 'Deskripsi',
  tags: 'Tags', views_count: 'Views', distance: 'Jarak',
  email: 'Email', role: 'Role', avatar_url: 'Avatar',
  reason: 'Alasan', approved_delete_request: 'ID Permintaan Hapus',
  rejected_delete_request: 'ID Permintaan Hapus', requested_by: 'Diminta oleh',
  place_name: 'Nama Place',
};

function formatValue(val: any): string {
  if (val === null || val === undefined || val === '') return '—';
  if (Array.isArray(val)) return val.join(', ') || '—';
  return String(val);
}

function formatDate(str: string) {
  return new Date(str).toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ─── Diff Table ──────────────────────────────────────────────────────────────

function DiffTable({ oldData, newData }: { oldData: Record<string, any> | null; newData: Record<string, any> | null }) {
  const allKeys = Array.from(new Set([
    ...Object.keys(oldData ?? {}),
    ...Object.keys(newData ?? {}),
  ])).filter(k => !SKIP_FIELDS.has(k));

  const changedKeys = oldData && newData
    ? allKeys.filter(k => String(oldData[k] ?? '') !== String(newData[k] ?? ''))
    : allKeys;

  if (changedKeys.length === 0) {
    return <p className="text-sm text-gray-400 italic">Tidak ada perubahan data yang terdeteksi.</p>;
  }

  const showDiff = !!(oldData && newData);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-1/4">Field</th>
            {showDiff ? (
              <>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sebelum</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 w-6"></th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sesudah</th>
              </>
            ) : (
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nilai</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {changedKeys.map(key => {
            const before = formatValue(oldData?.[key]);
            const after = formatValue(newData?.[key]);
            const changed = showDiff && before !== after;
            return (
              <tr key={key} className={changed ? 'bg-yellow-50' : 'bg-white'}>
                <td className="px-3 py-2.5 font-medium text-gray-600 text-xs">
                  {FIELD_LABEL[key] ?? key}
                </td>
                {showDiff ? (
                  <>
                    <td className={`px-3 py-2.5 text-xs ${changed ? 'text-red-600 line-through' : 'text-gray-600'} max-w-[160px] truncate`}>
                      {before}
                    </td>
                    <td className="px-1 py-2.5 text-gray-300 text-center">
                      <ArrowRight size={12} />
                    </td>
                    <td className={`px-3 py-2.5 text-xs ${changed ? 'text-green-700 font-medium' : 'text-gray-600'} max-w-[160px] truncate`}>
                      {after}
                    </td>
                  </>
                ) : (
                  <td className="px-3 py-2.5 text-xs text-gray-700 max-w-[240px] truncate">
                    {formatValue((newData ?? oldData)?.[key])}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

function ActivityDialog({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const meta = getMeta(log.action);
  const oldData = parseJson(log.old_data);
  const newData = parseJson(log.new_data);

  const hasOld = oldData && Object.keys(oldData).length > 0;
  const hasNew = newData && Object.keys(newData).length > 0;
  const showDiff = hasOld && hasNew;
  const showCreate = !hasOld && hasNew;
  const showDelete = hasOld && !hasNew;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
              {meta.icon} {meta.label}
            </div>
            {log.resource_type && (
              <span className="text-xs text-gray-400">
                {log.resource_type} #{log.resource_id}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta info bar */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <User size={12} />
            <span className="font-medium text-gray-700">{log.user_name || 'System'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {formatDate(log.created_at)}
          </span>
          {log.ip_address && (
            <span className="flex items-center gap-1.5">
              <Server size={12} />
              {log.ip_address}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {showDiff && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                Perubahan Data
              </h3>
              <DiffTable oldData={oldData} newData={newData} />
            </div>
          )}

          {showCreate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Data Baru
              </h3>
              <DiffTable oldData={null} newData={newData} />
            </div>
          )}

          {showDelete && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Data yang Dihapus
              </h3>
              <DiffTable oldData={oldData} newData={null} />
            </div>
          )}

          {!hasOld && !hasNew && (
            <p className="text-sm text-gray-400 italic">Tidak ada data tambahan untuk ditampilkan.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecentActivitySection({ logs }: { logs: AuditLog[] }) {
  const [selected, setSelected] = useState<AuditLog | null>(null);

  return (
    <>
      <div className="space-y-1">
        {logs.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
        )}
        {logs.map((log) => {
          const meta = getMeta(log.action);
          return (
            <button
              key={log.id}
              onClick={() => setSelected(log)}
              className="w-full text-left flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
            >
              <div className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${meta.bg} ${meta.color}`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{log.user_name || 'System'}</span>
                  {' '}
                  <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                  {log.resource_type && (
                    <span className="text-gray-400"> · {log.resource_type} #{log.resource_id}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(log.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                Detail →
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <ActivityDialog log={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
