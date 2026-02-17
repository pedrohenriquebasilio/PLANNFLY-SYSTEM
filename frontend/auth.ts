import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const SERVER_AUTH_SECRET = process.env.SERVER_AUTH_SECRET;

async function syncWithBackend(googleId: string, email: string, name: string) {
  const res = await fetch(`${BACKEND_URL}/auth/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-server-auth": SERVER_AUTH_SECRET!,
    },
    body: JSON.stringify({ googleId, email, name }),
  });

  if (!res.ok) {
    throw new Error(`Backend sync failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; email: string; name: string; subscriptionStatus: string };
  };
}

async function refreshBackendToken(refreshToken: string) {
  const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error(`Backend refresh failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data as { accessToken: string };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign-in, sync with backend
      if (account && profile) {
        try {
          const backendData = await syncWithBackend(
            account.providerAccountId,
            profile.email!,
            profile.name || profile.email!,
          );

          token.backendAccessToken = backendData.accessToken;
          token.backendRefreshToken = backendData.refreshToken;
          token.backendExpiresAt = Date.now() + backendData.expiresIn * 1000;
          token.userId = backendData.user.id;
          token.subscriptionStatus = backendData.user.subscriptionStatus;

          return token;
        } catch (error) {
          console.error("Backend sync error:", error);
          token.error = "BackendSyncError";
          return token;
        }
      }

      // On subsequent calls, check if backend token needs refresh
      if (token.backendExpiresAt && Date.now() < token.backendExpiresAt - 60_000) {
        // Token still valid (with 1 min buffer)
        return token;
      }

      // Token expired or about to expire, refresh it
      if (token.backendRefreshToken) {
        try {
          const refreshed = await refreshBackendToken(token.backendRefreshToken);
          token.backendAccessToken = refreshed.accessToken;
          token.backendExpiresAt = Date.now() + 900 * 1000; // 15 min
          token.error = undefined;
          return token;
        } catch (error) {
          console.error("Backend token refresh error:", error);
          token.error = "RefreshTokenError";
          return token;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.backendAccessToken = token.backendAccessToken;
      session.userId = token.userId ?? "";
      session.subscriptionStatus = token.subscriptionStatus;
      session.error = token.error;
      if (token.picture) session.user.image = token.picture;
      if (token.name) session.user.name = token.name;
      return session;
    },
  },
});
