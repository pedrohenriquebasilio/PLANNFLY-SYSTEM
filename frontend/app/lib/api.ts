import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000;

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.errors = errors;
  }
}

export function isApiConfigured(): boolean {
  return Boolean(API_URL && API_URL.length > 0);
}

export function getApiUrl(): string {
  if (!isApiConfigured()) {
    throw new Error(
      'API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env.local file.'
    );
  }
  return API_URL!;
}

// Token cache to avoid calling getSession() on every request
let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;
let tokenCachedAt = 0;
const TOKEN_CACHE_TTL = 60_000; // 1 min

async function getBackendToken(): Promise<string | null> {
  const now = Date.now();

  // Return cached token if still fresh
  if (cachedToken && now - tokenCachedAt < TOKEN_CACHE_TTL) {
    return cachedToken;
  }

  // Deduplicate concurrent getSession() calls
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  tokenFetchPromise = getSession()
    .then((session) => {
      cachedToken = session?.backendAccessToken ?? null;
      tokenCachedAt = Date.now();
      return cachedToken;
    })
    .catch(() => null)
    .finally(() => {
      tokenFetchPromise = null;
    });

  return tokenFetchPromise;
}

// Force refresh the cached token (e.g. after login)
export function invalidateTokenCache(): void {
  cachedToken = null;
  tokenCachedAt = 0;
}

// Build headers
async function buildHeaders(customHeaders?: HeadersInit): Promise<Headers> {
  const headers = new Headers(customHeaders);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = await getBackendToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

// Fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Handle 401 - clear session and redirect to login
function handleUnauthorized(): void {
  if (typeof window === 'undefined') return;
  invalidateTokenCache();
  signOut({ callbackUrl: '/login' });
}

// Handle 402 - redirect to subscription page to choose a plan
function handlePaymentRequired(): void {
  if (typeof window === 'undefined') return;
  window.location.href = '/subscription';
}

// Parse response
async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: T;

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = (await response.text()) as unknown as T;
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiException('Sessão expirada', 401);
  }

  if (response.status === 402) {
    handlePaymentRequired();
    throw new ApiException('Assinatura necessária', 402);
  }

  if (!response.ok) {
    const errorData = data as unknown as ApiError;
    throw new ApiException(
      errorData?.message || `Request failed with status ${response.status}`,
      response.status,
      errorData?.errors
    );
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
}

// Main request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const config: RequestInit = {
    ...options,
    headers: await buildHeaders(options.headers),
  };

  try {
    const response = await fetchWithTimeout(url, config);
    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408);
      }
      throw new ApiException(error.message, 0);
    }
    throw new ApiException('An unexpected error occurred', 0);
  }
}

// HTTP methods
export const api = {
  get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
