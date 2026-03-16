'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';

type Step = 'form' | 'success';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', placeholder: '@username atau link profil' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: '@username atau link profil' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', placeholder: '@username atau link profil' },
  { id: 'facebook', label: 'Facebook', icon: '👤', placeholder: 'Nama atau link profil' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'Nama channel atau link' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'URL profil LinkedIn' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', placeholder: 'Nomor WA (cth: 628123...)' },
];

interface SocialEntry {
  platform: string;
  value: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [socials, setSocials] = useState<SocialEntry[]>([]);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const addPlatform = (platformId: string) => {
    if (socials.find(s => s.platform === platformId)) return;
    setSocials(prev => [...prev, { platform: platformId, value: '' }]);
    setShowPlatformPicker(false);
  };

  const removePlatform = (platformId: string) => {
    setSocials(prev => prev.filter(s => s.platform !== platformId));
  };

  const updateSocial = (platformId: string, value: string) => {
    setSocials(prev => prev.map(s => s.platform === platformId ? { ...s, value } : s));
  };

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    p => !socials.find(s => s.platform === p.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const social_media = socials.reduce((acc, s) => {
      if (s.value.trim()) acc[s.platform] = s.value.trim();
      return acc;
    }, {} as Record<string, string>);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, social_media }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mendaftar');
        return;
      }
      setStep('success');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 text-sm">
            Akun kamu sudah terdaftar. Tunggu konfirmasi dari <strong>Super Admin</strong> untuk mengaktifkan akun sebelum bisa login.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
            ⏳ Status akun: <strong>Menunggu aktivasi</strong>
          </div>
          <Link
            href="/admin/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative w-full max-w-md my-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
              <span className="text-3xl">🏝️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Sebagai Admin</h1>
            <p className="text-gray-500 text-sm">Isi form di bawah untuk mendaftar akun admin baru</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="John Doe"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="john@example.com"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 karakter"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
              />
              <p className="text-xs text-gray-400 mt-1">
                Harus mengandung huruf besar, kecil, angka, dan simbol (!@#$%^&*)
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <input
                required
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Ulangi password"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>

            {/* Social Media Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Social Media <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                {availablePlatforms.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                      className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      <Plus size={16} />
                      Tambah
                    </button>

                    {/* Platform Picker Dropdown */}
                    {showPlatformPicker && (
                      <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg w-52 py-1 overflow-hidden">
                        {availablePlatforms.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addPlatform(p.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                          >
                            <span className="text-lg">{p.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Social Media Inputs */}
              <div className="space-y-2">
                {socials.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-400">
                      Klik <strong>Tambah</strong> untuk menambahkan akun social media
                    </p>
                  </div>
                )}

                {socials.map(s => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.id === s.platform)!;
                  return (
                    <div key={s.platform} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xl flex-shrink-0">{platform.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 leading-none mb-1">{platform.label}</p>
                        <input
                          type="text"
                          value={s.value}
                          onChange={e => updateSocial(s.platform, e.target.value)}
                          placeholder={platform.placeholder}
                          disabled={loading}
                          className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-60"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlatform(s.platform)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mendaftar...</span>
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/admin/login" className="text-indigo-600 hover:underline font-medium">
              Login di sini
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Singgah Sekejap. All rights reserved.
        </p>
      </div>

      {/* Close picker when clicking outside */}
      {showPlatformPicker && (
        <div className="fixed inset-0 z-0" onClick={() => setShowPlatformPicker(false)} />
      )}
    </div>
  );
}
