import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

const VALID_REASONS = ['info_salah', 'foto_tidak_sesuai', 'tempat_tutup', 'lainnya'];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'super_user') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const reports = await queries.reports.getAll(status ? { status } : undefined);
    return NextResponse.json(reports);
  } catch (err) {
    console.error('GET /api/reports error:', err);
    return NextResponse.json({ error: 'Gagal memuat laporan.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { place_id, place_name, reason, description, reporter_name, reporter_email } = body;

    if (!place_id || !place_name || !reason) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Alasan tidak valid.' }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Deskripsi terlalu panjang.' }, { status: 400 });
    }

    const report = await queries.reports.create({
      place_id: Number(place_id),
      place_name: String(place_name),
      reason,
      description: description?.trim() || undefined,
      reporter_name: reporter_name?.trim() || undefined,
      reporter_email: reporter_email?.trim() || undefined,
    });

    return NextResponse.json({ success: true, id: report.id });
  } catch (err) {
    console.error('POST /api/reports error:', err);
    return NextResponse.json({ error: 'Gagal mengirim laporan.' }, { status: 500 });
  }
}
