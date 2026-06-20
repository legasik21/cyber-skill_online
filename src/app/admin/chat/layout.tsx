import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Server-side gate for the admin dashboard. Previously this was enforced in the
// edge middleware, but /admin is now excluded from the middleware matcher (it is
// kept entirely out of i18n), so the protection lives here instead. Unauthenticated
// visitors are redirected to the login page; the admin chat APIs additionally
// self-check via requireAdmin().
export default async function AdminChatLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
