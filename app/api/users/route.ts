import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';
import { createUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'super_user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const users = await queries.users.getAll({
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
    });
    return NextResponse.json({ success: true, data: users });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'super_user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    const existing = await queries.users.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const user = await createUser({ name, email, password, role });
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuat user' }, { status: 500 });
  }
}
