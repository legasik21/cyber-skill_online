import type { DefaultSession } from 'next-auth';

// Expose the admin's DB id on the session/user/jwt (set in auth callbacks).
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
  interface User {
    id?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
