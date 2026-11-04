import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createAdminClient } from "@/lib/supabase/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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
    /**
     * El rol se resuelve una sola vez, al iniciar sesión: `user` llega solo en
     * ese momento y después el rol viaja en el token, así que no hay una
     * consulta a la base por cada request.
     *
     * Antes esta búsqueda estaba detrás de `account?.provider === "google"`, y
     * como el panel entra por mail y contraseña, el rol quedaba `undefined`
     * siempre. `proxy.ts` exige 'admin' o 'super_admin', así que el login
     * funcionaba y aun así el panel expulsaba a la home: parecía un problema de
     * contraseña y era de rol.
     *
     * La contracara de cachearlo en el token: cambiarle el rol a alguien no
     * tiene efecto hasta que vuelva a entrar. Para un panel de un solo
     * administrador es el intercambio correcto.
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
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
