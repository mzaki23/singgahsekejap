import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    if (!['reviewed', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    const report = await queries.reports.updateStatus(
      Number(params.id),
      status,
      (session.user as any).id
    );

    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error('PATCH /api/reports/[id] error:', err);
    return NextResponse.json({ error: 'Gagal mengupdate laporan.' }, { status: 500 });
  }
}
