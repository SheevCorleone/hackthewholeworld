import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          full_name: form.get("full_name"),
          password: form.get("password")
        })
      });
      router.push("/login");
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
          Регистрация
        </h1>
        <p className="subtitle">Создайте аккаунт студента за минуту.</p>
        <form onSubmit={handleSubmit} className="grid" style={{ marginTop: "20px", gap: "16px" }}>
          <div>
            <label className="label">ФИО</label>
            <input name="full_name" placeholder="Иван Иванов" className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" placeholder="student@nsu.ru" className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" placeholder="••••••••" className="input" required />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
            {loading ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
