'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';

export interface CsvRow {
  name: string;
  category: string;
  subcategory: string;
  category_badge: string;
  location: string;
  latitude: string;
  longitude: string;
  distance: string;
  image_url: string;
  short_description: string;
  full_description: string;
  tags: string;
  status: string;
}

interface Props {
  initialRows: CsvRow[];
  onCancel: () => void;
}

const CATEGORIES = ['makanan', 'pantai', 'taman', 'shopping', 'wisata'];
const STATUSES = ['draft', 'published'];
const COLUMNS: { key: keyof CsvRow; label: string; width: string }[] = [
  { key: 'name', label: 'Nama', width: 'min-w-[140px]' },
  { key: 'category', label: 'Kategori', width: 'min-w-[110px]' },
  { key: 'subcategory', label: 'Subkategori', width: 'min-w-[110px]' },
  { key: 'category_badge', label: 'Badge', width: 'min-w-[100px]' },
  { key: 'location', label: 'Lokasi', width: 'min-w-[140px]' },
  { key: 'latitude', label: 'Lat', width: 'min-w-[90px]' },
  { key: 'longitude', label: 'Lng', width: 'min-w-[90px]' },
  { key: 'distance', label: 'Jarak', width: 'min-w-[80px]' },
  { key: 'image_url', label: 'Image URL', width: 'min-w-[120px]' },
  { key: 'short_description', label: 'Deskripsi Singkat', width: 'min-w-[160px]' },
  { key: 'full_description', label: 'Deskripsi Lengkap', width: 'min-w-[160px]' },
  { key: 'tags', label: 'Tags (;)', width: 'min-w-[120px]' },
  { key: 'status', label: 'Status', width: 'min-w-[100px]' },
];

function isInvalid(row: CsvRow) {
  return !row.name?.trim() || !row.location?.trim();
}

export default function CsvPreviewTable({ initialRows, onCancel }: Props) {
  const [rows, setRows] = useState<CsvRow[]>(initialRows);
  const [editCell, setEditCell] = useState<{ row: number; col: keyof CsvRow } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const router = useRouter();

  const validCount = rows.filter(r => !isInvalid(r)).length;
  const invalidCount = rows.filter(r => isInvalid(r)).length;

  function updateCell(rowIdx: number, col: keyof CsvRow, value: string) {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [col]: value } : r));
  }

  function deleteRow(rowIdx: number) {
    setRows(prev => prev.filter((_, i) => i !== rowIdx));
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch('/api/places/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ imported: data.imported, skipped: data.skipped });
        router.refresh();
      } else {
        alert('Gagal import: ' + (data.error || 'Unknown error'));
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-3">
        <div className="text-green-600 text-xl font-bold">Import Berhasil!</div>
        <p className="text-gray-600">
          <span className="font-semibold text-green-700">{result.imported} baris</span> berhasil diimport,{' '}
          <span className="font-semibold text-red-500">{result.skipped} baris</span> dilewati.
        </p>
        <button
          onClick={onCancel}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <span>
          Jika ada row yang kosong atau tidak lengkap, tidak akan terinput. Mohon dicek kembali datanya sebelum di approve.
        </span>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-700 font-medium">{validCount} baris siap import</span>
        {invalidCount > 0 && (
          <span className="text-red-500 font-medium">{invalidCount} baris invalid (akan dilewati)</span>
        )}
        <span className="text-gray-400">· {rows.length} total</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="text-xs w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-2 text-gray-500 font-medium w-8">#</th>
              {COLUMNS.map(col => (
                <th key={col.key} className={`px-2 py-2 text-left text-gray-500 font-medium ${col.width}`}>
                  {col.label}
                </th>
              ))}
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const invalid = isInvalid(row);
              return (
                <tr
                  key={ri}
                  className={`border-b border-gray-100 ${invalid ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-2 py-1 text-gray-400 text-center">{ri + 1}</td>
                  {COLUMNS.map(col => {
                    const isEditing = editCell?.row === ri && editCell?.col === col.key;
                    const isSelectCol = col.key === 'category' || col.key === 'status';

                    return (
                      <td
                        key={col.key}
                        className={`px-1 py-1 ${col.width}`}
                        onClick={() => !isEditing && setEditCell({ row: ri, col: col.key })}
                      >
                        {isEditing && isSelectCol ? (
                          <select
                            autoFocus
                            value={row[col.key]}
                            onChange={e => updateCell(ri, col.key, e.target.value)}
                            onBlur={() => setEditCell(null)}
                            className="w-full border border-indigo-400 rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            {(col.key === 'category' ? CATEGORIES : STATUSES).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : isEditing ? (
                          <input
                            autoFocus
                            value={row[col.key]}
                            onChange={e => updateCell(ri, col.key, e.target.value)}
                            onBlur={() => setEditCell(null)}
                            className="w-full border border-indigo-400 rounded px-1 py-0.5 text-xs focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`block truncate max-w-[180px] cursor-text rounded px-1 py-0.5 hover:bg-indigo-50 ${
                              !row[col.key] && (col.key === 'name' || col.key === 'location')
                                ? 'text-red-400 italic'
                                : 'text-gray-700'
                            }`}
                            title={row[col.key]}
                          >
                            {row[col.key] || (col.key === 'name' || col.key === 'location' ? '(wajib diisi)' : '—')}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={() => deleteRow(ri)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus baris"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={loading || validCount === 0}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
        >
          {loading ? 'Mengimport...' : `Konfirmasi Import (${validCount} baris)`}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
