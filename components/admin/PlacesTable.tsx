'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Pencil, Trash2, PlusCircle, Save, X, TableProperties } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const CATEGORY_EMOJI: Record<string, string> = {
  makanan: '🍔', pantai: '🏖️', taman: '🌳', shopping: '🛍️', wisata: '🎡',
};

const CATEGORIES = ['makanan', 'pantai', 'taman', 'shopping', 'wisata'];

interface NewRow {
  _key: number;
  name: string;
  category: string;
  subcategory: string;
  location: string;
  status: string;
  error?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      ${status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function generateSlug(name: string) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

let newRowCounter = 0;

function SortableHeader({ label, field, sortKey, sortDir, onSort }: {
  label: string; field: string; sortKey: string | null; sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
}) {
  const active = sortKey === field;
  return (
    <th onClick={() => onSort(field)} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left cursor-pointer select-none group">
      <span className="flex items-center gap-1">
        {label}
        <span className={`text-xs ${active ? 'text-indigo-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
          {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}

// Modal for admin delete request
function DeleteRequestModal({ place, onClose, onSubmit }: {
  place: { id: number; name: string };
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await onSubmit(reason);
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Ajukan Permintaan Hapus</h3>
          <p className="text-sm text-gray-500 mt-1">
            Permintaan untuk menghapus <strong>{place.name}</strong> akan dikirim ke super admin untuk disetujui.
          </p>
        </div>
        <div className="p-5 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Alasan (opsional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Tuliskan alasan penghapusan..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
          />
        </div>
        <div className="p-5 pt-0 flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-all">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50">
            {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlacesTable({ places, role }: { places: any[]; role?: string }) {
  const router = useRouter();
  const isSuperUser = role === 'super_user';
  const [deleting, setDeleting] = useState<number | null>(null);
  const [requestModal, setRequestModal] = useState<{ id: number; name: string } | null>(null);

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedPlaces = sortKey
    ? [...places].sort((a, b) => {
        const va = a[sortKey] ?? '';
        const vb = b[sortKey] ?? '';
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : places;

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<number, any>>({});
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

  const [addMode, setAddMode] = useState(false);
  const [newRows, setNewRows] = useState<NewRow[]>([]);

  const [saving, setSaving] = useState(false);

  const handleDelete = async (id: number, name: string) => {
    if (isSuperUser) {
      if (!confirm(`Hapus "${name}"?`)) return;
      setDeleting(id);
      try {
        const res = await fetch(`/api/places/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        toast.success('Place dihapus');
        router.refresh();
      } catch {
        toast.error('Gagal menghapus place');
      } finally {
        setDeleting(null);
      }
    } else {
      setRequestModal({ id, name });
    }
  };

  const handleSubmitDeleteRequest = async (reason: string) => {
    if (!requestModal) return;
    setDeleting(requestModal.id);
    try {
      const res = await fetch(`/api/places/${requestModal.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      if (data.pending) {
        toast.success('Permintaan hapus telah dikirim ke super admin');
      } else {
        toast.success('Place dihapus');
        router.refresh();
      }
      setRequestModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim permintaan');
    } finally {
      setDeleting(null);
    }
  };

  function updateExisting(id: number, field: string, value: string) {
    setEditData(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), [field]: value } }));
    setDirtyIds(prev => new Set(prev).add(id));
  }

  function updateNewRow(key: number, field: string, value: string) {
    setNewRows(prev => prev.map(r => r._key === key ? { ...r, [field]: value, error: false } : r));
  }

  function addNewRow() {
    newRowCounter++;
    setNewRows(prev => [...prev, {
      _key: newRowCounter,
      name: '', category: 'wisata', subcategory: '', location: '', status: 'draft',
    }]);
  }

  function removeNewRow(key: number) {
    setNewRows(prev => prev.filter(r => r._key !== key));
  }

  function enterAddMode() {
    setAddMode(true);
    newRowCounter++;
    setNewRows([{ _key: newRowCounter, name: '', category: 'wisata', subcategory: '', location: '', status: 'draft' }]);
  }

  function cancelAddMode() {
    setAddMode(false);
    setNewRows([]);
  }

  function cancelEditMode() {
    setEditMode(false);
    setEditData({});
    setDirtyIds(new Set());
  }

  async function handleSaveNew() {
    setSaving(true);
    const validated = newRows.map(r => ({
      ...r,
      error: !r.name.trim() || !r.location.trim(),
    }));
    if (validated.some(r => r.error)) {
      setNewRows(validated);
      setSaving(false);
      return;
    }
    let hasError = false;
    for (const row of validated) {
      try {
        const res = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            slug: generateSlug(row.name),
            category: row.category,
            subcategory: row.subcategory,
            location: row.location,
            status: row.status,
          }),
        });
        if (!res.ok) throw new Error();
      } catch {
        toast.error(`Gagal menyimpan: ${row.name || '(baris baru)'}`);
        hasError = true;
      }
    }
    setSaving(false);
    if (!hasError) {
      toast.success(`${validated.length} place berhasil ditambahkan`);
      cancelAddMode();
      router.refresh();
    }
  }

  async function handleSaveAll() {
    setSaving(true);
    let hasError = false;
    for (const id of dirtyIds) {
      try {
        const res = await fetch(`/api/places/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData[id]),
        });
        if (!res.ok) throw new Error();
      } catch {
        const place = places.find(p => p.id === id);
        toast.error(`Gagal update: ${place?.name ?? id}`);
        hasError = true;
      }
    }
    setSaving(false);
    if (!hasError) {
      toast.success('Semua perubahan disimpan');
      cancelEditMode();
      router.refresh();
    }
  }

  if (places.length === 0 && !addMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-lg">Tidak ada place ditemukan</p>
        <button
          onClick={enterAddMode}
          className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
        >
          + Tambah place baru
        </button>
      </div>
    );
  }

  return (
    <>
      {requestModal && (
        <DeleteRequestModal
          place={requestModal}
          onClose={() => setRequestModal(null)}
          onSubmit={handleSubmitDeleteRequest}
        />
      )}
      {/* ── DESKTOP ── */}
      <div className="hidden md:block space-y-4">

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {!editMode && !addMode && (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 border border-gray-300 hover:border-indigo-400 bg-white text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <Pencil size={14} /> Mode Edit
              </button>
              <button
                onClick={enterAddMode}
                className="flex items-center gap-2 border border-green-400 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <TableProperties size={14} /> Tambah Banyak
              </button>
            </>
          )}

          {addMode && (
            <>
              <button
                onClick={addNewRow}
                className="flex items-center gap-2 border border-green-400 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <PlusCircle size={14} /> Tambah Baris Lagi
              </button>
              <button
                onClick={handleSaveNew}
                disabled={newRows.length === 0 || saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
              </button>
              <button
                onClick={cancelAddMode}
                className="flex items-center gap-2 border border-gray-300 hover:border-red-400 bg-white text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <X size={14} /> Batal
              </button>
            </>
          )}

          {editMode && (
            <>
              <button
                onClick={handleSaveAll}
                disabled={dirtyIds.size === 0 || saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
              </button>
              <button
                onClick={cancelEditMode}
                className="flex items-center gap-2 border border-gray-300 hover:border-red-400 bg-white text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <X size={14} /> Batal
              </button>
            </>
          )}
        </div>

        {/* ── Section Tambah Baru ── */}
        {addMode && (
          <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-b border-green-200">
              <h3 className="text-sm font-semibold text-green-800">Tambah Place Baru</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                {newRows.length} baris
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Nama *', 'Kategori', 'Subkategori', 'Lokasi *', 'Status', ''].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 5 ? 'text-right w-12' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {newRows.map(row => (
                    <tr key={row._key} className={row.error ? 'bg-red-50' : 'bg-green-50'}>
                      <td className="px-4 py-2">
                        <input
                          value={row.name}
                          onChange={e => updateNewRow(row._key, 'name', e.target.value)}
                          placeholder="Nama tempat"
                          className={`w-full border rounded px-2 py-1.5 text-sm ${row.error && !row.name.trim() ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} focus:ring-1 focus:ring-indigo-400 focus:outline-none`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={row.category}
                          onChange={e => updateNewRow(row._key, 'category', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={row.subcategory}
                          onChange={e => updateNewRow(row._key, 'subcategory', e.target.value)}
                          placeholder="Subkategori"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={row.location}
                          onChange={e => updateNewRow(row._key, 'location', e.target.value)}
                          placeholder="Lokasi"
                          className={`w-full border rounded px-2 py-1.5 text-sm ${row.error && !row.location.trim() ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} focus:ring-1 focus:ring-indigo-400 focus:outline-none`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={row.status}
                          onChange={e => updateNewRow(row._key, 'status', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeNewRow(row._key)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tabel Data Existing ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableHeader label="Nama" field="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Kategori" field="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Subkategori</th>
                  <SortableHeader label="Lokasi" field="location" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Rating" field="rating" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Status" field="status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Views" field="views_count" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Dibuat" field="created_at" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Ditambahkan oleh" field="created_by_name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedPlaces.map((place) => {
                  const isDirty = dirtyIds.has(place.id);
                  const d = editData[place.id] ?? {};
                  return (
                    <tr key={place.id} className={`transition-colors ${isDirty ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        {editMode ? (
                          <input
                            value={d.name ?? place.name}
                            onChange={e => updateExisting(place.id, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                          />
                        ) : (
                          <>
                            <p className="font-medium text-sm">
                              <Link
                                href={`/${place.category}/${place.slug}`}
                                target="_blank"
                                className="text-gray-900 hover:text-indigo-600 hover:underline transition-colors"
                              >
                                {place.name}
                              </Link>
                            </p>
                            <p className="text-xs text-gray-400">{place.slug}</p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editMode ? (
                          <select
                            value={d.category ?? place.category}
                            onChange={e => updateExisting(place.id, 'category', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-700 capitalize">
                            {CATEGORY_EMOJI[place.category]} {place.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editMode ? (
                          <input
                            value={d.subcategory ?? (place.subcategory ?? '')}
                            onChange={e => updateExisting(place.id, 'subcategory', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{place.subcategory || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editMode ? (
                          <input
                            value={d.location ?? (place.location ?? '')}
                            onChange={e => updateExisting(place.id, 'location', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{place.location || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-yellow-600">⭐ {place.rating || '0.0'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editMode ? (
                          <select
                            value={d.status ?? place.status}
                            onChange={e => updateExisting(place.id, 'status', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                          >
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                          </select>
                        ) : (
                          <StatusBadge status={place.status} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{place.views_count ?? 0}</td>
                      <td className="px-4 py-3">
                        {place.created_at ? (
                          <div>
                            <p className="text-xs text-gray-700">
                              {new Date(place.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(place.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{place.created_by_name ?? <span className="text-gray-400">—</span>}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {!editMode && !addMode && (
                            <Link href={`/admin/places/${place.id}/edit`}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                              <Pencil size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(place.id, place.name)}
                            disabled={deleting === place.id}
                            title={isSuperUser ? 'Hapus' : 'Minta Hapus'}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="md:hidden space-y-3">
        {(editMode || addMode) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 text-center">
            Gunakan desktop untuk mode edit / tambah banyak
          </div>
        )}
        {places.map((place) => (
          <div key={place.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={place.status} />
                  <span className="text-xs text-gray-500 capitalize">
                    {CATEGORY_EMOJI[place.category]} {place.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{place.name}</h3>
                {place.location && (
                  <p className="text-xs text-gray-400 mt-0.5">📍 {place.location}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="text-yellow-600 font-medium">⭐ {place.rating || '0.0'}</span>
                  <span>👁 {place.views_count ?? 0} views</span>
                  {place.created_at && (
                    <span>🗓 {new Date(place.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                  {place.created_by_name && (
                    <span>👤 {place.created_by_name}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Link href={`/admin/places/${place.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-all">
                  <Pencil size={13} /> Edit
                </Link>
                <button onClick={() => handleDelete(place.id, place.name)} disabled={deleting === place.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-all disabled:opacity-50">
                  <Trash2 size={13} /> {isSuperUser ? 'Hapus' : 'Minta Hapus'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
