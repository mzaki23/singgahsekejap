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

const VALID_CATEGORIES = ['makanan', 'pantai', 'taman', 'shopping', 'wisata'];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Required field validation
    if (!body.name?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
    if (!body.location?.trim()) return NextResponse.json({ error: 'Lokasi wajib diisi' }, { status: 400 });
    if (!VALID_CATEGORIES.includes(body.category)) return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
    if (body.name.length > 200) return NextResponse.json({ error: 'Nama terlalu panjang' }, { status: 400 });
    if (body.short_description?.length > 500) return NextResponse.json({ error: 'Deskripsi singkat terlalu panjang' }, { status: 400 });
    if (body.latitude != null && (isNaN(Number(body.latitude)) || Number(body.latitude) < -90 || Number(body.latitude) > 90)) {
      return NextResponse.json({ error: 'Latitude tidak valid' }, { status: 400 });
    }
    if (body.longitude != null && (isNaN(Number(body.longitude)) || Number(body.longitude) < -180 || Number(body.longitude) > 180)) {
      return NextResponse.json({ error: 'Longitude tidak valid' }, { status: 400 });
    }

    const place = await queries.places.create(body);

    await queries.audit.log({
      user_id: parseInt(session.user.id),
      action: 'create_place',
      resource_type: 'place',
      resource_id: place.id,
      new_data: place,
    });

    if (session.user.role !== 'super_user') {
      await queries.notifications.create({
        type: 'place_created',
        title: 'Place Baru Ditambahkan',
        message: `${session.user.name ?? 'Admin'} menambahkan place baru: "${place.name}" (${place.category})`,
        link: `/admin/places/${place.id}/edit`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: place }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal membuat place' }, { status: 500 });
  }
}
