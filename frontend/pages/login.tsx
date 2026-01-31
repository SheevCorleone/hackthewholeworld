import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useAuth } from "../components/auth";
import { apiRequest } from "../components/api";
import Input from "../components/Input";
import Button from "../components/Button";
import styles from "../styles/Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      const me = await login(data.access_token, data.refresh_token);
      const roleRedirects: Record<string, string> = {
        manager: "/manager",
        admin: "/manager",
        curator: "/curator/projects",
        student: "/student/projects",
        mentor: "/mentor/projects",
        univ_teacher: "/univ/approvals",
        univ_supervisor: "/univ/approvals",
        univ_admin: "/univ/approvals",
        hr: "/hr/dashboard",
        academic_partnership_admin: "/manager/projects"
      };
      router.replace(roleRedirects[me.role] || "/login");
    } catch (err) {
      const message = (err as Error).message;
      const lower = message.toLowerCase();
      if (lower.includes("pending")) {
        setError("Учетная запись ожидает подтверждения менеджером.");
      } else if (lower.includes("disabled")) {
        setError("Учетная запись отключена. Обратитесь к менеджеру.");
      } else {
        setError(message);
      }
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
