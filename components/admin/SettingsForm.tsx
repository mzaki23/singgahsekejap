'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsForm({ user }: { user: any }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      if (!res.ok) throw new Error();
      toast.success('Profil berhasil diupdate');
    } catch {
      toast.error('Gagal update profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: passwords.newPass, current_password: passwords.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      toast.success('Password berhasil diubah');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Gagal update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <form onSubmit={handleProfile} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Profil Akun</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            required
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            required
            type="email"
            value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profileLoading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {profileLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Simpan Profil
          </button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePassword} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Ganti Password</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
          <input
            required
            type="password"
            value={passwords.current}
            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
          <input
            required
            type="password"
            value={passwords.newPass}
            onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
          <input
            required
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {passwordLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Ganti Password
          </button>
        </div>
      </form>
    </div>
  );
}
