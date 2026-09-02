import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createAdminClient } from "@/lib/supabase/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const supabase = createAdminClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });
        if (error || !data.user) return null;
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name ?? null,
          image: data.user.user_metadata?.avatar_url ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      if (account?.provider === "google" && token.sub) {
        const supabase = createAdminClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", token.sub)
          .single();
        token.role = profile?.role ?? "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  /**
   * Sin esto, Auth.js rechaza con `UntrustedHost` cualquier request cuyo Host no
   * coincida exactamente con NEXTAUTH_URL, y el panel queda inaccesible apenas se
   * despliega en un dominio distinto o detrás de un proxy inverso.
   *
   * Confiar en el Host es seguro acá porque no lo usamos para ninguna decisión de
   * seguridad: los redirects del panel son rutas relativas y la autorización se
   * resuelve con el rol del JWT, no con el origen del pedido.
   */
  trustHost: true,
});
