import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`${ip}:reviews`, 5, 60 * 60 * 1000); // 5 per jam
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
  }

  try {
    const { place_id, user_name, user_email, rating, comment } = await req.json();

    if (!place_id || !user_name || !rating) {
      return NextResponse.json({ error: 'place_id, user_name, dan rating wajib diisi' }, { status: 400 });
    }

    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 });
    }

    const review = await queries.reviews.create({
      place_id: parseInt(place_id),
      user_name: user_name.trim(),
      user_email: user_email?.trim() || undefined,
      rating: ratingNum,
      comment: comment?.trim() || undefined,
    });

    return NextResponse.json({ success: true, data: review });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
