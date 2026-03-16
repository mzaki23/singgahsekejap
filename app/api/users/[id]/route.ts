import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Password change
    if (body.new_password !== undefined) {
      const user = await queries.users.findById(parseInt(params.id));
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const valid = await verifyPassword(body.current_password, user.password_hash);
      if (!valid) return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });

      const password_hash = await hashPassword(body.new_password);
      await queries.users.update(parseInt(params.id), { password_hash });
      return NextResponse.json({ success: true });
    }

    // Profile or status update
    const { new_password, current_password, ...updateData } = body;
    const user = await queries.users.update(parseInt(params.id), updateData);
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'super_user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await queries.users.delete(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
