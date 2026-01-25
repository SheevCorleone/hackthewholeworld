import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const data = await apiRequest<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="card" style={{ maxWidth: "460px", margin: "0 auto" }}>
        <h1 className="section-title" style={{ fontSize: "26px" }}>
          Вход
        </h1>
        <p className="subtitle">Доступ к задачам и статусам вашей команды.</p>
        <form onSubmit={handleSubmit} className="grid" style={{ marginTop: "20px", gap: "16px" }}>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" placeholder="team@sber.ru" className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" placeholder="••••••••" className="input" required />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
