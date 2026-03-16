import { NextRequest, NextResponse } from 'next/server';
import { queries, db } from '@/lib/db';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword, social_media = {} } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password tidak cocok' }, { status: 400 });
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    const existing = await queries.users.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    await db.queryOne(
      `INSERT INTO users (name, email, password_hash, role, status, social_media)
       VALUES ($1, $2, $3, 'admin', 'inactive', $4) RETURNING id`,
      [name, email, password_hash, JSON.stringify(social_media)]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
