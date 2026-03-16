import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { status, reviewed_by } = await req.json();
    const review = await queries.reviews.updateStatus(
      parseInt(params.id),
      status,
      parseInt(reviewed_by) || parseInt(session.user?.id || '0')
    );
    if (review?.place_id) {
      await queries.places.recalculateRating(review.place_id);
    }
    return NextResponse.json({ success: true, data: review });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const review = await queries.reviews.getById(parseInt(params.id));
    await queries.reviews.delete(parseInt(params.id));
    if (review?.place_id) {
      await queries.places.recalculateRating(review.place_id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
