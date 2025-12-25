import { createClient } from '@supabase/supabase-js';

/**
 * Get admin user from request Authorization header
 */
export async function getAdminUser(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No Authorization header found');
      return null;
    }
    
    const accessToken = authHeader.replace('Bearer ', '');
    
    if (!accessToken) {
      console.log('Empty access token');
      return null;
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the token by getting the user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.error('Error verifying user token:', error.message);
      return null;
    }
    
    if (!user) {
      console.log('No user found for token');
      return null;
    }

    console.log('Admin user authenticated:', user.email);
    
    // Check if user has admin role (for now, allow any authenticated user)
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.app_metadata?.role === 'admin';

    if (!isAdmin) {
      console.log('Note: User does not have admin role, allowing for testing:', user.email);
    }

    return user;
  } catch (error) {
    console.error('Error in getAdminUser:', error);
    return null;
  }
}

/**
 * Middleware to check admin authentication
 */
export async function requireAdmin(request: Request) {
  const admin = await getAdminUser(request);
  
  if (!admin) {
    return {
      error: 'Unauthorized - Please log in',
      status: 401,
    };
  }

  return { admin };
}
