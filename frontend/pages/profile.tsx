import { FormEvent, useEffect, useState } from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Badge from "../components/Badge";
import ErrorText from "../components/ErrorText";
import { apiRequest } from "../components/api";
import styles from "../styles/Profile.module.css";

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<UserProfile>("/auth/me")
      .then(setUser)
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setStatus(null);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await apiRequest<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: form.get("full_name"),
          avatar_url: form.get("avatar_url")
        })
      });
      setUser(updated);
      setStatus("Сохранено");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <h1 className={styles.title}>Личный кабинет</h1>
      {error && <ErrorText style={{ marginTop: "12px" }}>{error}</ErrorText>}
      {user && (
        <div className={styles.grid}>
          <Card>
            <div className={styles.row}>
              <div className={styles.avatar}>{(user.full_name || "U").slice(0, 1)}</div>
              <div>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-600)" }}>Профиль</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>{user.full_name}</div>
                <div style={{ color: "var(--muted-600)" }}>{user.email}</div>
                <Badge tone="sber" style={{ marginTop: "8px" }}>{user.role}</Badge>
              </div>
            </div>
          </Card>
          <Card>
            <h2>Настройки</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
              <Input name="full_name" label="ФИО" defaultValue={user.full_name} />
              <Input name="avatar_url" label="Avatar URL" defaultValue={user.avatar_url || ""} placeholder="https://..." />
              <Button type="submit">Сохранить</Button>
              {status && <p style={{ color: "var(--muted-600)" }}>{status}</p>}
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
