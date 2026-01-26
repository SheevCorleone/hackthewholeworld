import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";
import Input from "../components/Input";
import Button from "../components/Button";
import styles from "../styles/Auth.module.css";

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
      router.push("/manager");
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
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Доступна только менеджеру для создания пользователей.</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input name="full_name" label="ФИО" placeholder="Иван Иванов" required />
            <Input name="email" type="email" label="Email" placeholder="student@nsu.ru" required />
            <Input name="password" type="password" label="Password" placeholder="••••••••" required />
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" loading={loading} style={{ width: "100%" }}>
              {loading ? "Создаём..." : "Создать аккаунт"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
