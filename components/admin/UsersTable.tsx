'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UserCheck, UserX, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SOCIAL_META: Record<string, { label: string; icon: string; baseUrl?: string }> = {
  instagram: { label: 'Instagram', icon: '📸', baseUrl: 'https://instagram.com/' },
  tiktok:    { label: 'TikTok',    icon: '🎵', baseUrl: 'https://tiktok.com/@' },
  twitter:   { label: 'X/Twitter', icon: '🐦', baseUrl: 'https://x.com/' },
  facebook:  { label: 'Facebook',  icon: '👤', baseUrl: 'https://facebook.com/' },
  youtube:   { label: 'YouTube',   icon: '▶️', baseUrl: 'https://youtube.com/' },
  linkedin:  { label: 'LinkedIn',  icon: '💼' },
  whatsapp:  { label: 'WhatsApp',  icon: '💬', baseUrl: 'https://wa.me/' },
};

function SocialLink({ platform, value }: { platform: string; value: string }) {
  const meta = SOCIAL_META[platform] ?? { label: platform, icon: '🔗' };
  const href = value.startsWith('http')
    ? value
    : meta.baseUrl ? `${meta.baseUrl}${value.replace('@', '')}` : undefined;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={`${meta.label}: ${value}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-indigo-100 border border-gray-200 hover:border-indigo-300 rounded-full text-xs text-gray-600 hover:text-indigo-700 transition-all">
      <span>{meta.icon}</span>
      <span className="max-w-[80px] truncate">{value.replace('@', '')}</span>
    </a>
  );
}

function SocialMediaCell({ social_media }: { social_media: Record<string, string> | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!social_media || Object.keys(social_media).length === 0) {
    return <span className="text-xs text-gray-300">—</span>;
  }
  const entries = Object.entries(social_media);
  const visible = expanded ? entries : entries.slice(0, 2);
  return (
    <div className="flex flex-wrap gap-1 max-w-[200px]">
      {visible.map(([p, v]) => <SocialLink key={p} platform={p} value={v} />)}
      {entries.length > 2 && (
        <button onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-0.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
          {expanded ? <><ChevronUp size={12} />Sembunyikan</> : <><ChevronDown size={12} />+{entries.length - 2}</>}
        </button>
      )}
    </div>
  );
}

export default function UsersTable({ users, currentUserId }: { users: any[]; currentUserId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  const toggleStatus = async (user: any) => {
    if (user.id.toString() === currentUserId) { toast.error('Tidak dapat menonaktifkan akun sendiri'); return; }
    setLoading(user.id);
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`User ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
      router.refresh();
    } catch { toast.error('Gagal update user'); }
    finally { setLoading(null); }
  };

  const handleDelete = async (user: any) => {
    if (user.id.toString() === currentUserId) { toast.error('Tidak dapat menghapus akun sendiri'); return; }
    if (!confirm(`Hapus user "${user.name}"?`)) return;
    setLoading(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('User dihapus');
      router.refresh();
    } catch { toast.error('Gagal hapus user'); }
    finally { setLoading(null); }
  };

  return (
    <>
      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['User', 'Role', 'Status', 'Social Media', 'Last Login', 'Bergabung', 'Aksi'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Aksi' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.id.toString() === currentUserId ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {user.name}
                          {user.id.toString() === currentUserId && <span className="ml-1 text-xs text-indigo-500">(Anda)</span>}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.role === 'super_user' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'super_user' ? 'Super User' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4"><SocialMediaCell social_media={user.social_media} /></td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {user.last_login ? new Date(user.last_login).toLocaleString('id-ID') : 'Belum pernah'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleStatus(user)} disabled={loading === user.id}
                        className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                        title={user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}>
                        {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button onClick={() => handleDelete(user)} disabled={loading === user.id || user.id.toString() === currentUserId}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30">
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
        {users.map((user) => (
          <div key={user.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 ${user.id.toString() === currentUserId ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {user.name}
                    {user.id.toString() === currentUserId && <span className="ml-1 text-xs text-indigo-500">(Anda)</span>}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleStatus(user)} disabled={loading === user.id}
                  className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  title={user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}>
                  {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                </button>
                <button onClick={() => handleDelete(user)} disabled={loading === user.id || user.id.toString() === currentUserId}
                  className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-all disabled:opacity-30">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                ${user.role === 'super_user' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user.role === 'super_user' ? 'Super User' : 'Admin'}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.status}
              </span>
            </div>

            {/* Social Media */}
            {user.social_media && Object.keys(user.social_media).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Social Media</p>
                <SocialMediaCell social_media={user.social_media} />
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
              <span>Login: {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Belum pernah'}</span>
              <span>Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
