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
          // For now, use the hardcoded admin users as fallback
          // In production, this should query the database
          const ADMIN_USERS = [
            {
              id: '1',
              email: 'admin@intandokaziherbal.co.za',
              name: 'Admin User',
              role: 'super_admin',
              password: 'Intandokazi@2024',
              permissions: {
                can_manage_products: true,
                can_manage_orders: true,
                can_manage_customers: true,
                can_view_financials: true,
                can_manage_settings: true,
              }
            },
            {
              id: '2',
              email: 'nthandokazi@intandokaziherbal.co.za',
              name: 'Nthandokazi Mokoatle',
              role: 'admin',
              password: 'Nthandokazi@2024',
              permissions: {
                can_manage_products: true,
                can_manage_orders: true,
                can_manage_customers: true,
                can_view_financials: true,
                can_manage_settings: true,
              }
            },
            {
              id: '3',
              email: 'manager@intandokaziherbal.co.za',
              name: 'Manager',
              role: 'admin',
              password: 'Manager@2024',
              permissions: {
                can_manage_products: true,
                can_manage_orders: true,
                can_manage_customers: true,
                can_view_financials: true,
                can_manage_settings: true,
              }
            }
          ];

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

