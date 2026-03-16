# Setup Database Production

## 1. Jalankan Schema SQL

Setelah database PostgreSQL (Neon / Vercel Postgres) tersedia:

1. Buka console database — di Neon: **SQL Editor**, di Vercel Postgres: **Query** tab
2. Buka file `database/schema.sql` di repo ini
3. Copy seluruh isi file, paste ke SQL editor, lalu **Run**

## 2. Verifikasi

Jalankan query berikut untuk memastikan tabel berhasil dibuat:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Tabel yang diharapkan muncul:
- `users`
- `destinations`
- `categories`
- (tabel lain sesuai schema)

## 3. Buat Admin User (Opsional via SQL)

Jika seed admin belum ada, jalankan:

```sql
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@explorebatam.com',
  -- hash bcrypt dari password kamu, generate di: https://bcrypt-generator.com/
  '$2a$10$HASH_DI_SINI',
  'admin'
);
```

> **Catatan:** Gunakan bcrypt hash dengan cost factor 10. Jangan simpan plain-text password.

## 4. Connection Strings

Pastikan variabel berikut sudah diisi di Vercel Dashboard sebelum deploy:

| Variabel | Dipakai untuk |
|---|---|
| `POSTGRES_URL` | Query runtime (pooled) |
| `POSTGRES_PRISMA_URL` | Jika menggunakan Prisma |
| `POSTGRES_URL_NON_POOLING` | Migrations & direct queries |

Lihat `.env.production.example` untuk format lengkapnya.
