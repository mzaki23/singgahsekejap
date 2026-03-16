'use client';

const DIFF_FIELDS = ['name', 'category', 'location', 'status', 'rating', 'short_description', 'image_url'];

interface AuditEntry {
  id: number;
  action: string;
  user_name: string | null;
  user_role: string | null;
  created_at: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
}

interface Props {
  history: AuditEntry[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DiffView({ oldData, newData }: { oldData: Record<string, any>; newData: Record<string, any> }) {
  const changes = DIFF_FIELDS.filter(
    (field) => String(oldData[field] ?? '') !== String(newData[field] ?? '')
  );

  if (changes.length === 0) {
    return <p className="text-xs text-gray-400 mt-1">Tidak ada perubahan pada field utama.</p>;
  }

  return (
    <div className="mt-2 space-y-1">
      {changes.map((field) => (
        <div key={field} className="text-xs">
          <span className="font-medium text-gray-600">{field}:</span>{' '}
          <span className="line-through text-red-500">{String(oldData[field] ?? '—')}</span>
          {' → '}
          <span className="text-green-600">{String(newData[field] ?? '—')}</span>
        </div>
      ))}
    </div>
  );
}

export default function PlaceAuditHistory({ history }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-gray-800">Riwayat Perubahan</h2>
        <span className="text-xs bg-gray-100 text-gray-600 border border-gray-300 rounded px-2 py-0.5">
          🔒 Super User Only
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada riwayat audit untuk tempat ini.</p>
      ) : (
        <ol className="relative border-l border-gray-200 ml-3 space-y-5">
          {history.map((entry) => {
            const isCreate = entry.action === 'create_place';
            return (
              <li key={entry.id} className="ml-4">
                <span className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-sm">
                  {isCreate ? '➕' : '✏️'}
                </span>
                <div className="pl-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium text-gray-800 text-sm">
                      {entry.user_name ?? 'Unknown'}
                    </span>
                    {entry.user_role && (
                      <span className="text-xs text-gray-400">({entry.user_role})</span>
                    )}
                    <span className="text-xs text-gray-400">—</span>
                    <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isCreate ? 'Membuat tempat baru' : 'Mengedit tempat'}
                  </p>
                  {!isCreate && entry.old_data && entry.new_data && (
                    <DiffView oldData={entry.old_data} newData={entry.new_data} />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
