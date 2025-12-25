import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface Conversation {
  id: string;
  visitor_id: string;
  status: 'new' | 'active' | 'closed';
  assigned_agent_id: string | null;
  created_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'visitor' | 'agent';
  sender_id: string | null;
  body: string;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  conversation_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

// Server-side Supabase client (full access) - lazy initialized
let _supabaseAdmin: SupabaseClient | null = null;

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables');
      }

      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return (_supabaseAdmin as any)[prop];
  }
});

// Client-side Supabase client (for auth)
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase public environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};
