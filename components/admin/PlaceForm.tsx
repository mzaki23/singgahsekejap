'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LocateFixed, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap'),
  { ssr: false, loading: () => <div className="h-[280px] bg-gray-100 rounded-lg animate-pulse" /> }
);

function GPSButton({ onGetGPS, loading }: { onGetGPS: () => void; loading: boolean }) {
  const isHttpOnNetwork =
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost';

  if (isHttpOnNetwork) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
        <span>⚠️</span>
        <span>GPS butuh HTTPS — jalankan <code className="font-mono bg-yellow-100 px-1 rounded">npm run dev:tunnel</code> lalu akses via URL tunnel</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onGetGPS}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
    >
      {loading
        ? <><Loader2 size={15} className="animate-spin" /> Mengambil GPS...</>
        : <><LocateFixed size={15} /> Gunakan GPS</>
      }
    </button>
  );
}

const CATEGORIES = ['makanan', 'pantai', 'taman', 'shopping', 'wisata'];

const SUBCATEGORIES: Record<string, string[]> = {
  makanan: ['kopi', 'resto', 'street-food', 'dessert'],
  pantai: ['pasir-putih', 'sunset', 'snorkeling', 'swimming'],
  taman: ['jogging', 'playground', 'pet-friendly', 'bunga'],
  shopping: ['mall', 'traditional', 'outlet', 'electronics', 'fashion'],
  wisata: ['family', 'adventure', 'indoor', 'outdoor', 'instagramable'],
};

interface PlaceFormProps {
  place?: any;
  userId: string;
}

export default function PlaceForm({ place, userId }: PlaceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const getGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Browser tidak mendukung GPS');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        toast.success(`Koordinat berhasil diambil`);
        setGpsLoading(false);
      },
      (err) => {
        const msg: Record<number, string> = {
          1: 'Izin lokasi ditolak. Buka Pengaturan browser → izinkan akses lokasi.',
          2: 'Sinyal GPS lemah. Coba di luar ruangan atau aktifkan lokasi perangkat.',
          3: 'Timeout. Pastikan GPS aktif lalu coba lagi.',
        };
        const isHttp = location.protocol === 'http:' && location.hostname !== 'localhost';
        toast.error(
          isHttp
            ? 'GPS butuh HTTPS. Akses via https:// atau gunakan ngrok.'
            : (msg[err.code] || 'Gagal mengambil lokasi'),
          { duration: 5000 }
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const [form, setForm] = useState({
    name: place?.name || '',
    category: place?.category || 'makanan',
    subcategory: place?.subcategory || '',
    category_badge: place?.category_badge || '',
    location: place?.location || '',
    latitude: place?.latitude || '',
    longitude: place?.longitude || '',
    distance: place?.distance || '',
    image_url: place?.image_url || '',
    short_description: place?.short_description || '',
    full_description: place?.full_description || '',
    tags: place?.tags?.join(', ') || '',
    status: place?.status || 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = place?.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = {
      ...form,
      slug,
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      distance: form.distance ? parseFloat(form.distance) : null,
      created_by: parseInt(userId),
    };

    try {
      const url = place ? `/api/places/${place.id}` : '/api/places';
      const method = place ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal menyimpan');

      toast.success(place ? 'Place berhasil diupdate' : 'Place berhasil ditambahkan');
      router.push('/admin/places');
      router.refresh();
    } catch {
      toast.error('Gagal menyimpan place');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Informasi Dasar</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tempat *</label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Kopi Kenangan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
            <select
              required
              value={form.category}
              onChange={set('category')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subkategori</label>
            <select
              value={form.subcategory}
              onChange={set('subcategory')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih subkategori</option>
              {(SUBCATEGORIES[form.category] || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Badge</label>
            <input
              value={form.category_badge}
              onChange={set('category_badge')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="☕ KOPI"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Lokasi</h2>
          <GPSButton onGetGPS={getGPS} loading={gpsLoading} />
        </div>

        {/* GPS result preview */}
        {form.latitude && form.longitude && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            <LocateFixed size={13} />
            <span>Koordinat: <strong>{form.latitude}</strong>, <strong>{form.longitude}</strong></span>
            <a
              href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto underline hover:text-green-900"
            >
              Cek di Maps →
            </a>
          </div>
        )}

        {/* Live Map Picker */}
        <LocationPickerMap
          lat={form.latitude ? parseFloat(form.latitude) : null}
          lng={form.longitude ? parseFloat(form.longitude) : null}
          onChange={(lat, lng) =>
            setForm(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))
          }
        />
        <p className="text-xs text-gray-400">Klik peta atau geser pin untuk menentukan koordinat</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat/Area *</label>
            <input
              required
              value={form.location}
              onChange={set('location')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Nagoya Hill"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jarak (km)</label>
            <input
              type="number"
              step="0.1"
              value={form.distance}
              onChange={set('distance')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
              {gpsLoading && <span className="ml-2 text-xs text-green-600 font-normal">mengambil...</span>}
            </label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={set('latitude')}
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-colors
                ${form.latitude ? 'border-green-300 bg-green-50/30' : 'border-gray-300'}`}
              placeholder="1.1217"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
              {gpsLoading && <span className="ml-2 text-xs text-green-600 font-normal">mengambil...</span>}
            </label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={set('longitude')}
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-colors
                ${form.longitude ? 'border-green-300 bg-green-50/30' : 'border-gray-300'}`}
              placeholder="104.0305"
            />
          </div>
        </div>
      </div>

      {/* Media & Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Media & Deskripsi</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
          <input
            value={form.image_url}
            onChange={set('image_url')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (pisah koma)</label>
          <input
            value={form.tags}
            onChange={set('tags')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Free WiFi, Instagramable, Murah Meriah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
          <textarea
            rows={2}
            value={form.short_description}
            onChange={set('short_description')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Deskripsi singkat untuk kartu tempat..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
          <textarea
            rows={4}
            value={form.full_description}
            onChange={set('full_description')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Deskripsi lengkap untuk halaman detail..."
          />
        </div>
      </div>

      {/* Status & Submit */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={set('status')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {place ? 'Update Place' : 'Simpan Place'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
