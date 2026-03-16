import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_user') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const notifications = await queries.notifications.getAll();
    const unreadCount = await queries.notifications.getUnreadCount();
    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Mark all read
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_user') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await queries.notifications.markAllRead();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
