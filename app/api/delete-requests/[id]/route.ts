import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_user') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action } = await req.json(); // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
    }

    const requestId = parseInt(params.id);
    const deleteRequest = await queries.deleteRequests.getById(requestId);
    if (!deleteRequest) {
      return NextResponse.json({ error: 'Request tidak ditemukan' }, { status: 404 });
    }
    if (deleteRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request sudah diproses' }, { status: 409 });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    await queries.deleteRequests.updateStatus(requestId, status, parseInt(session.user.id));

    // Jika disetujui, hapus place-nya
    if (action === 'approve') {
      await queries.places.delete(deleteRequest.place_id);
      await queries.audit.log({
        user_id: parseInt(session.user.id),
        action: 'delete_place',
        resource_type: 'place',
        resource_id: deleteRequest.place_id,
        old_data: { name: deleteRequest.place_name, category: deleteRequest.place_category },
        new_data: { approved_delete_request: requestId, requested_by: deleteRequest.requested_by_name },
      });
    } else {
      await queries.audit.log({
        user_id: parseInt(session.user.id),
        action: 'reject_delete_place',
        resource_type: 'place',
        resource_id: deleteRequest.place_id,
        new_data: { rejected_delete_request: requestId, requested_by: deleteRequest.requested_by_name, place_name: deleteRequest.place_name },
      });
    }

    return NextResponse.json({ success: true, status });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
