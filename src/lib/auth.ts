import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createClient } from '@/utils/supabase/server';

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
          const supabase = await createClient();
          
          // Get admin user from database
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', credentials.email)
            .eq('is_active', true)
            .single();

          if (error || !adminUser) {
            console.error('Admin user not found:', error);
            return null;
          }

          // Verify password (for now, using a simple password check)
          // In production, you might want to use Supabase Auth or hash passwords
          const defaultPassword = 'admin123'; // Default password for all admin users
          if (credentials.password !== defaultPassword) {
            return null;
          }

          // Update last login
          await supabase
            .from('admin_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', adminUser.id);

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.full_name,
            role: adminUser.role,
            permissions: {
              can_manage_products: adminUser.can_manage_products,
              can_manage_orders: adminUser.can_manage_orders,
              can_manage_customers: adminUser.can_manage_customers,
              can_view_financials: adminUser.can_view_financials,
              can_manage_settings: adminUser.can_manage_settings,
            }
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

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
