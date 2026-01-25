function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
}

export const API_URL = getApiBaseUrl();

function getHealthUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/backend-health`;
  }
  return "http://localhost:8000/health";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  } as Record<string, string>;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed")) {
      throw new Error(`Не удалось подключиться к серверу. Проверьте, что backend запущен: ${getHealthUrl()}`);
    }
    throw err;
  }

  if (!response.ok) {
    const message = await response.json().catch(() => ({ detail: "Request failed" }));
    const detail = typeof message.detail === "string" ? message.detail : message.detail?.[0]?.msg || "Request failed";
    throw new Error(detail);
  }

  return response.json();
}
