import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET || 'development-secret-key-replace-in-production-12345',
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      // Guest-only login/forgot/reset sub-paths under /admin/login
      const isLoginPath = nextUrl.pathname.startsWith('/admin/login');

      if (isOnAdmin) {
        if (isLoginPath) {
          if (isLoggedIn) {
            return Response.redirect(new URL('/admin', nextUrl));
          }
          return true;
        }

        if (isLoggedIn) {
          const userRole = (auth.user as any)?.role;
          
          // Protect admin-only subfolders from non-administrator roles
          if (
            nextUrl.pathname.startsWith('/admin/users') ||
            nextUrl.pathname.startsWith('/admin/plugins') ||
            nextUrl.pathname.startsWith('/admin/themes') ||
            nextUrl.pathname.startsWith('/admin/settings')
          ) {
            if (userRole !== 'administrator') {
              return Response.redirect(new URL('/admin', nextUrl));
            }
          }
          return true;
        }

        // Return false to redirect unauthenticated users to /admin/login
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.login = (user as any).login;
        token.displayName = (user as any).displayName;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).login = token.login as string;
        (session.user as any).displayName = token.displayName as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Overridden in auth.ts with Credentials provider
} satisfies NextAuthConfig;
