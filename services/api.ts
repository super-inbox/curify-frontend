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
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers,
      });

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
