import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";
import Input from "../components/Input";
import Button from "../components/Button";
import styles from "../styles/Auth.module.css";

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
      const me = await apiRequest<{ role: string }>("/auth/me");
      const roleRedirects: Record<string, string> = {
        manager: "/manager",
        admin: "/manager",
        curator: "/curator/projects",
        student: "/student/projects",
        mentor: "/mentor/projects"
      };
      router.push(roleRedirects[me.role] || "/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>Доступ к задачам и статусам вашей команды.</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input name="email" type="email" label="Email" placeholder="team@sber.ru" required />
            <Input name="password" type="password" label="Password" placeholder="••••••••" required />
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" loading={loading} style={{ width: "100%" }}>
              {loading ? "Входим..." : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
