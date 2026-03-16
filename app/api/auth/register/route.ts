import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';
import { hashPassword, validatePassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`${ip}:register`, 5, 60 * 60 * 1000); // 5 per jam
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
  }

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
    const newUser = await queries.users.create({ name, email, password_hash, role: 'admin' });
    if (!newUser) throw new Error('Gagal membuat akun');

    // Set status inactive setelah insert (kolom opsional di schema)
    await queries.users.update(newUser.id, { status: 'inactive' }).catch(() => {});

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
