// Server-side admin authentication, backed by the NextAuth (Auth.js) session.
// Replaces the former Supabase Bearer-token verification. Admin API routes call
// `requireAdmin()`; the session cookie is read automatically by `auth()`.

import { auth } from '@/auth';

export interface AdminContext {
  id: string;
  email: string | null;
}

export async function getAdminUser(): Promise<AdminContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

export async function requireAdmin(): Promise<
  { admin: AdminContext } | { error: string; status: number }
> {
  const admin = await getAdminUser();
  if (!admin) {
    return { error: 'Unauthorized - Please log in', status: 401 };
  }
  return { admin };
}
