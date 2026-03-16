import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function POST(req: NextRequest) {
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
