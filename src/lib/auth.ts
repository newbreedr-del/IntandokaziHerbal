import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Admin users loaded from environment variables (never hardcode passwords in source)
          // Set ADMIN_USERS_JSON in your environment as a JSON array, e.g.:
          // [{"id":"1","email":"admin@intandokaziherbal.co.za","name":"Admin","role":"super_admin","password":"yourpassword"}]
          const rawUsers = process.env.ADMIN_USERS_JSON;
          if (!rawUsers) {
            console.error('[Auth] ADMIN_USERS_JSON environment variable is not set');
            return null;
          }
          let ADMIN_USERS: Array<{
            id: string; email: string; name: string; role: string; password: string;
            permissions?: Record<string, boolean>;
          }>;
          try {
            ADMIN_USERS = JSON.parse(rawUsers);
          } catch {
            console.error('[Auth] ADMIN_USERS_JSON is not valid JSON');
            return null;
          }

          // Find user in admin list
          const user = ADMIN_USERS.find(u => u.email === credentials.email);
          
          if (!user) {
            console.error('Admin user not found:', credentials.email);
            return null;
          }

          // Verify password against user's specific password
          if (credentials.password !== user.password) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

