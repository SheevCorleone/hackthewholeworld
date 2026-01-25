import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import ErrorText from "../components/ErrorText";
import { apiRequest } from "../components/api";
import styles from "../styles/Dashboard.module.css";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<User>("/auth/me")
      .then(setUser)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Layout>
      <h1 className={styles.title}>Dashboard</h1>
      {error && <ErrorText style={{ marginTop: "12px" }}>{error}</ErrorText>}
      {user && (
        <Card style={{ marginTop: "24px" }}>
          <div className={styles.metaRow}>
            <div>
              <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-600)" }}>Logged in</p>
              <p className={styles.metaName}>{user.full_name}</p>
              <p style={{ color: "var(--muted-600)", margin: 0 }}>Role: {user.role}</p>
            </div>
            <Badge tone="sber">Синхронизация активна · 100%</Badge>
          </div>
          <div className={styles.grid}>
            <Card style={{ background: "#f8faf9" }}>
              <h2>Следующие шаги</h2>
              <ul style={{ marginTop: "12px", paddingLeft: "18px", color: "var(--muted-600)", display: "grid", gap: "8px" }}>
                <li>Проверьте открытые задачи и выберите релевантный кейс.</li>
                <li>Запросите участие и ожидайте подтверждения ментора.</li>
                <li>Обновляйте статус и оставляйте комментарии.</li>
              </ul>
            </Card>
            <Card style={{ background: "#f8faf9" }}>
              <h2>Рекомендации для куратора</h2>
              <ul style={{ marginTop: "12px", paddingLeft: "18px", color: "var(--muted-600)", display: "grid", gap: "8px" }}>
                <li>Создайте новый кейс и назначьте ментора.</li>
                <li>Соберите команды и утвердите заявки.</li>
                <li>Закройте кейс с итоговым статусом.</li>
              </ul>
            </Card>
          </div>
        </Card>
      )}
    </Layout>
  );
}
