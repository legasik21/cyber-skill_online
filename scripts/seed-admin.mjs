#!/usr/bin/env node
/**
 * Idempotently create (or update) the first admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Re-running never duplicates the admin — it upserts on email and refreshes the hash.
 *
 *   DATABASE_URL=postgres://cyberskill:***@127.0.0.1:5432/cyberskill \
 *   ADMIN_EMAIL=admin@cyberskill.online ADMIN_PASSWORD=*** \
 *   node scripts/seed-admin.mjs
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!connectionString) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}
if (!email || !password) {
  console.error('Missing ADMIN_EMAIL / ADMIN_PASSWORD');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const client = new pg.Client({ connectionString });
await client.connect();
try {
  const res = await client.query(
    `INSERT INTO admin_users (email, password_hash, name)
     VALUES (LOWER($1), $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, email, (xmax = 0) AS inserted`,
    [email, hash, 'Administrator'],
  );
  const row = res.rows[0];
  console.log(`${row.inserted ? 'Created' : 'Updated'} admin "${row.email}" (id ${row.id})`);
} finally {
  await client.end();
}
