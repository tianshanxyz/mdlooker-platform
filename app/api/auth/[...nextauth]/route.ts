import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { createClient } from '@supabase/supabase-js';

// 延迟初始化 Supabase 客户端
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase URL and Service Role Key are required');
  }
  
  return createClient(url, key);
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'linkedin') {
        try {
          const supabase = getSupabaseClient();
          
          // Check if user exists in Supabase
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

          if (!existingUser) {
            // Create new user in Supabase Auth
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
              email: user.email!,
              email_confirm: true,
              user_metadata: {
                full_name: user.name,
                avatar_url: user.image,
              },
            });

            if (authError) {
              console.error('Error creating user:', authError);
              return false;
            }

            // Store social account connection
            if (authUser.user) {
              await supabase.from('user_social_accounts').insert({
                user_id: authUser.user.id,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at ? new Date(account.expires_at * 1000) : null,
              });
            }
          } else {
            // Update social account connection
            await supabase.from('user_social_accounts').upsert({
              user_id: existingUser.id,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at ? new Date(account.expires_at * 1000) : null,
            }, {
              onConflict: 'provider,provider_account_id'
            });
          }

          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const supabase = getSupabaseClient();
          
          // Fetch user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (profile) {
            (session.user as any).id = profile.id;
            (session.user as any).role = profile.role;
            (session.user as any).subscriptionStatus = profile.subscription_status;
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        (token as any).id = user.id;
      }
      if (account) {
        (token as any).accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
