import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const places = await queries.places.getAll({
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return NextResponse.json({ success: true, data: places });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const place = await queries.places.create(body);

    await queries.audit.log({
      user_id: parseInt(session.user.id),
      action: 'create_place',
      resource_type: 'place',
      resource_id: place.id,
      new_data: place,
    });

    return NextResponse.json({ success: true, data: place }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal membuat place' }, { status: 500 });
  }
}
