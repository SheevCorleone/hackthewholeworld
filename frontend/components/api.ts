function getApiBaseUrl(): string {
  // В браузере ВСЕГДА ходим в backend по localhost:8000 (или по env, если задано)
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  }
  // На сервере (SSR) тоже берём env или дефолт
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
}

export const API_URL = getApiBaseUrl();

function getHealthUrl(): string {
  return "http://localhost:8000/health";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed")) {
      throw new Error(`Не удалось подключиться к серверу. Проверьте, что backend запущен: ${getHealthUrl()}`);
    }
    throw err;
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    if (response.status === 403 && typeof window !== "undefined") {
      window.location.href = "/403";
    }

    const message = await response.json().catch(() => ({ detail: "Request failed" }));
    const detail =
      typeof message.detail === "string" ? message.detail : message.detail?.[0]?.msg || "Request failed";
    throw new Error(detail);
  }

  // если вдруг 204
  if (response.status === 204) return undefined as unknown as T;

  return response.json();
}
