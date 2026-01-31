import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

export default function ManagerNewCuratorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    const next = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPasswordValue(next);
  };

  const copyPassword = async () => {
    if (!passwordValue) return;
    await navigator.clipboard.writeText(passwordValue);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/manager/curators", {
        method: "POST",
        body: JSON.stringify({
          role: "curator",
          email: form.get("email"),
          full_name: form.get("full_name"),
          password: form.get("password") || passwordValue,
          faculty: form.get("faculty"),
          skills: form.get("skills"),
          course: form.get("course")
        })
      });
      router.push("/manager/curators");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <h1 className={styles.title}>Создать куратора</h1>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <Input name="full_name" label="ФИО" required />
          <Input name="email" type="email" label="Email" required />
          <div className={styles.gridTwo}>
            <Input
              name="password"
              type="text"
              label="Пароль"
              required
              value={passwordValue}
              onChange={(event) => setPasswordValue(event.target.value)}
            />
            <div className={styles.toolbar}>
              <Button type="button" variant="secondary" onClick={generatePassword}>
                Сгенерировать
              </Button>
              <Button type="button" variant="ghost" onClick={copyPassword} disabled={!passwordValue}>
                Скопировать
              </Button>
            </div>
          </div>
          <div className={styles.gridTwo}>
            <Input name="faculty" label="Факультет" />
            <Input name="course" label="Курс" />
          </div>
          <Input name="skills" label="Навыки" placeholder="Product, аналитика" />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={loading}>
            Создать
          </Button>
        </form>
      </Layout>
    </RouteGuard>
  );
}
