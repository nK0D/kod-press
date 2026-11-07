import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { roleFromCapabilities } from '@/lib/access';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        login: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null;
        }

        const loginStr = credentials.login as string;
        const passwordStr = credentials.password as string;

        try {
          const user = await db.user.findFirst({
            where: {
              OR: [
                { login: loginStr },
                { email: loginStr },
              ],
            },
            include: {
              meta: true,
            },
          });

          if (!user) {
            return null;
          }

          // Verify user status (0 = active)
          if (user.status !== 0) {
            return null;
          }

          const isValid = await bcrypt.compare(passwordStr, user.password);
          if (!isValid) {
            return null;
          }

          const role = roleFromCapabilities(user.meta.find((m) => m.key === 'capabilities')?.value);

          return {
            id: String(user.id),
            name: user.displayName,
            email: user.email,
            login: user.login,
            displayName: user.displayName,
            role,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
});
