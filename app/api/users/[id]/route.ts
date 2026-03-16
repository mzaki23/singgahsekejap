import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetId = parseInt(params.id);
    const sessionId = parseInt(session.user.id);
    const isSuperUser = session.user.role === 'super_user';

    // Only super_user can update other users; regular users can only update themselves
    if (targetId !== sessionId && !isSuperUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Password change
    if (body.new_password !== undefined) {
      const user = await queries.users.findById(targetId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      // Super user changing someone else's password doesn't need current_password
      if (targetId === sessionId) {
        const valid = await verifyPassword(body.current_password, user.password_hash);
        if (!valid) return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
      }

      const password_hash = await hashPassword(body.new_password);
      await queries.users.update(targetId, { password_hash });
      return NextResponse.json({ success: true });
    }

    // Profile or status update — only super_user can change role/status of others
    const { new_password, current_password, ...updateData } = body;
    if (targetId !== sessionId && !isSuperUser) {
      delete updateData.role;
      delete updateData.status;
    }
    // Non-super_user cannot escalate their own role
    if (!isSuperUser) {
      delete updateData.role;
    }

    const user = await queries.users.update(targetId, updateData);
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

    const targetId = parseInt(params.id);
    const sessionId = parseInt(session.user.id);

    // Prevent super_user from deleting themselves
    if (targetId === sessionId) {
      return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
    }

    await queries.users.delete(targetId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
