import type { RoleName } from '@/lib/roles';

// Typed fields KodPress carries through the NextAuth user, session, and JWT.
declare module '@auth/core/types' {
  interface User {
    login?: string;
    displayName?: string;
    role?: RoleName;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    login?: string;
    displayName?: string;
    role?: RoleName;
  }
}
