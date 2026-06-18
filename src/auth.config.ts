import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe base config (no Node-only providers/deps). Used directly by the
 * middleware to read/decode the JWT session, and spread into the full Node
 * instance in `src/auth.ts` where the Credentials provider is added.
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      // token.id is set as a string in the jwt() callback above; the cast works
      // around Auth.js v5 not merging the next-auth/jwt augmentation into the
      // callback's token type.
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
