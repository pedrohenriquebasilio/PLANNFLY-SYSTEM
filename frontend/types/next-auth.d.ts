import "next-auth";
import "@auth/core/types";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    userId?: string;
    subscriptionStatus?: string;
    error?: string;
  }
}

declare module "@auth/core/types" {
  interface Session {
    backendAccessToken?: string;
    userId?: string;
    subscriptionStatus?: string;
    error?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    backendAccessToken?: string;
    backendRefreshToken?: string;
    backendExpiresAt?: number;
    userId?: string;
    subscriptionStatus?: string;
    error?: string;
  }
}
