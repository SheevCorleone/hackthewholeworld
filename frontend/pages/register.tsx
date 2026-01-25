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
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        <p className="mt-2 text-sm text-slate-500">Создайте аккаунт студента за минуту.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-500">ФИО</label>
            <input name="full_name" placeholder="Иван Иванов" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </div>
          <div>
            <label className="text-xs text-slate-500">Email</label>
            <input name="email" type="email" placeholder="student@nsu.ru" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </div>
          <div>
            <label className="text-xs text-slate-500">Password</label>
            <input name="password" type="password" placeholder="••••••••" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">
            {loading ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
