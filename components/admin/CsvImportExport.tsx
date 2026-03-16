'use client';

import { useRef, useState } from 'react';
import { Download, Upload, X, FileDown } from 'lucide-react';
import CsvPreviewTable, { CsvRow } from './CsvPreviewTable';

const CSV_COLUMNS = [
  'name', 'category', 'subcategory', 'category_badge',
  'location', 'latitude', 'longitude', 'distance',
  'image_url', 'short_description', 'full_description', 'tags', 'status',
];

function downloadData(places: any[]) {
  const header = CSV_COLUMNS.join(',');
  const rows = places.map(p => {
    const values = CSV_COLUMNS.map(col => {
      let val = '';
      if (col === 'tags') {
        val = Array.isArray(p.tags) ? p.tags.join(';') : (p.tags ?? '');
      } else {
        val = p[col] !== undefined && p[col] !== null ? String(p[col]) : '';
      }
      return val.includes(',') ? `"${val}"` : val;
    });
    return values.join(',');
  });
  const csv = [header, ...rows].join('\n') + '\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'places_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTemplate() {
  const header = CSV_COLUMNS.join(',');
  const example = [
    'Nama Tempat', 'wisata', 'alam', 'Wisata Alam',
    'Batam Center', '1.1234', '104.1234', '5',
    '', 'Deskripsi singkat', 'Deskripsi lengkap', 'tag1;tag2', 'draft',
  ].join(',');
  const csv = `${header}\n${example}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'places_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        values.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur.trim());

    const row: Partial<CsvRow> = {};
    headers.forEach((h, i) => {
      (row as any)[h] = values[i] ?? '';
    });

    return CSV_COLUMNS.reduce((acc, col) => {
      (acc as any)[col] = (row as any)[col] ?? '';
      return acc;
    }, {} as CsvRow);
  });
}

export default function CsvImportExport({ places = [] }: { places?: any[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<CsvRow[] | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setPreviewRows(parseCsv(text));
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => downloadData(places)}
          disabled={places.length === 0}
          className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Download data CSV"
        >
          <FileDown size={15} />
          <span className="hidden sm:inline">Download Data</span>
        </button>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm transition-all"
          title="Download template CSV"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Template</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm transition-all"
          title="Import CSV"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Import CSV</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Modal overlay for CSV preview */}
      {previewRows !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-[98vw] mx-2 my-6 bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Preview Import CSV</h2>
              <button
                onClick={() => setPreviewRows(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <CsvPreviewTable
              initialRows={previewRows}
              onCancel={() => setPreviewRows(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
