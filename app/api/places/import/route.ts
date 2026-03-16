import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { rows } = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      if (!row.name?.trim() || !row.location?.trim()) {
        skipped++;
        continue;
      }

      try {
        const slug = generateSlug(row.name);
        const tags = row.tags
          ? row.tags.split(';').map((t: string) => t.trim()).filter(Boolean)
          : [];

        await queries.places.create({
          slug,
          name: row.name.trim(),
          category: row.category || 'wisata',
          subcategory: row.subcategory || '',
          category_badge: row.category_badge || '',
          location: row.location.trim(),
          latitude: row.latitude ? parseFloat(row.latitude) : null,
          longitude: row.longitude ? parseFloat(row.longitude) : null,
          distance: row.distance ? parseFloat(row.distance) : 0,
          image_url: row.image_url || null,
          short_description: row.short_description || null,
          full_description: row.full_description || null,
          tags,
          status: row.status === 'published' ? 'published' : 'draft',
          created_by: session.user?.id ? parseInt(session.user.id) : null,
        });

        imported++;
      } catch {
        skipped++; // duplikat slug atau error lain → skip
      }
    }

    return NextResponse.json({ success: true, imported, skipped });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, error: 'Gagal import data' }, { status: 500 });
  }
}
