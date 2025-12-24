import { createSupabaseClient } from '@/lib/db';

/**
 * Get admin user from Supabase session
 * Returns admin user object if authenticated, null otherwise
 */
export async function getAdminUser(request: Request) {
  const supabase = createSupabaseClient();
  
  // Get session from cookies
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }

  // Get user details
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Check if user has admin role
  // This depends on how you set up admin roles in Supabase
  // Option 1: Check user metadata
  const isAdmin = user.user_metadata?.role === 'admin' || 
                  user.app_metadata?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  return user;
}

/**
 * Middleware to check admin authentication
 */
export async function requireAdmin(request: Request) {
  const admin = await getAdminUser(request);
  
  if (!admin) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  return { admin };
}
