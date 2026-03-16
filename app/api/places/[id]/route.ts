import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const place = await queries.places.getById(parseInt(params.id));
    if (!place) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: place });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // If password change request (settings page)
    if (body.new_password !== undefined) {
      const { verifyPassword, hashPassword } = await import('@/lib/auth');
      const user = await import('@/lib/db').then(m => m.queries.users.findById(parseInt(params.id)));
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const valid = await verifyPassword(body.current_password, user.password_hash);
      if (!valid) return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });

      const password_hash = await hashPassword(body.new_password);
      await queries.users.update(parseInt(params.id), { password_hash });
      return NextResponse.json({ success: true });
    }

    const oldPlace = await queries.places.getById(parseInt(params.id));
    const place = await queries.places.update(parseInt(params.id), body);

    await queries.audit.log({
      user_id: parseInt(session.user.id),
      action: 'update_place',
      resource_type: 'place',
      resource_id: parseInt(params.id),
      old_data: oldPlace,
      new_data: place,
    });

    return NextResponse.json({ success: true, data: place });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await queries.places.delete(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
