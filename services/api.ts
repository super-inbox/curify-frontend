interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;

    console.log("[ApiClient:init]", {
      baseURL: this.baseURL,
      runtime: typeof window === "undefined" ? "server" : "browser",
    });
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isServer = typeof window === "undefined";
    const isFormData = options.body instanceof FormData;

    const token = !isServer
      ? localStorage.getItem("access_token")
      : null;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // 🔍 LOG EVERYTHING IMPORTANT
    console.log("[ApiClient:request]", {
      runtime: isServer ? "server" : "browser",
      baseURL: this.baseURL,
      endpoint,
      url,
      method: options.method || "GET",
    });

    const start = Date.now();

    try {

      // credentials: "include" forces Next.js to bypass the Data Cache
      // (since cookies imply per-user content). Only send it when we
      // actually have a token to attach — server-side public reads
      // (no localStorage token) get to participate in the cache.
      const fetchOptions: RequestInit = {
        ...options,
        headers,
      };
      if (token) {
        fetchOptions.credentials = "include";
      }
      const response = await fetch(url, fetchOptions);

      const durationMs = Date.now() - start;

      console.log("[ApiClient:response]", {
        url,
        status: response.status,
        ok: response.ok,
        durationMs,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("[ApiClient:error-response]", {
          url,
          status: response.status,
          body: text,
        });
        // Centralized 401 handling — JWT expired / invalid / signed
        // with a rotated key. Clear persisted auth state and notify
        // listeners (authProvider) so the UI re-prompts sign-in instead
        // of repeating 401s while the user appears logged in.
        // Skip when the request didn't carry a token (login/OTP/etc.):
        // those 401s are validation failures, not session-expiry.
        if (response.status === 401 && !isServer) {
          const stillHadToken = localStorage.getItem("access_token");
          if (stillHadToken) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("curifyUser");
            window.dispatchEvent(new CustomEvent("auth:expired"));
          }
        }
        throw new Error(`API Error ${response.status}: ${text}`);
      }

      return response.json();
    } catch (err: any) {
      const durationMs = Date.now() - start;

      console.error("[ApiClient:fetch-failed]", {
        url,
        durationMs,
        error: err?.message,
        cause: err?.cause, // 🔥 Node fetch (undici) details
        stack: err?.stack,
      });

      throw err;
    }
  }
}

export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});
