import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { db } from '@/lib/db';

export const testUserEmail = 'test@example.com';

const {
  handlers,
  auth: internalAuth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user: _user, account, profile }) {
      if (account && profile?.email) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;

        try {
          const databaseUser = await db.user.upsert({
            where: { email: profile.email },
            update: {
              name: profile.name,
              image: profile.picture as string,
            },
            create: {
              email: profile.email,
              name: profile.name,
              image: profile.picture as string,
            },
          });
          token.id = databaseUser.id;
        } catch {
          console.log('Database not available, using email as ID');
          token.id = profile.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.image = token.picture!;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/documents');
      if (isOnDashboard) {
        console.log(
          'Middleware check. Path:',
          nextUrl.pathname,
          'TEST_MODE:',
          process.env.TEST_MODE,
          'IsLoggedIn:',
          isLoggedIn
        );
        const isGuestTest = nextUrl.searchParams.get('guest') === 'true';
        if (isGuestTest) return false;
        if (process.env.TEST_MODE === 'true') return true;
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  debug: process.env.NODE_ENV === 'development',
});

export const auth = async () => {
  if (process.env.TEST_MODE === 'true') {
    try {
      const user = await db.user.upsert({
        where: { email: testUserEmail },
        update: {},
        create: {
          id: 'test-user-id',
          email: testUserEmail,
          name: 'Test User',
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Failed to upsert test user:', error);

      return {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: testUserEmail,
          image: null,
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    }
  }
  return internalAuth();
};

export { handlers, signIn, signOut, internalAuth as middleware };
