import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";
import Card from "../components/Card";
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
      {error && <p className={styles.error}>{error}</p>}
      {user && (
        <Card>
          <div className={styles.metaRow}>
            <div>
              <p className={styles.metaLabel}>Logged in</p>
              <p className={styles.metaName}>{user.full_name}</p>
              <p className={styles.metaRole}>Role: {user.role}</p>
            </div>
            <span className={styles.badge}>Синхронизация активна · 100%</span>
          </div>
          <div className={styles.grid}>
            <Card>
              <h2>Следующие шаги</h2>
              <ul>
                <li>Проверьте открытые задачи и выберите релевантный кейс.</li>
                <li>Запросите участие и ожидайте подтверждения ментора.</li>
                <li>Обновляйте статус и оставляйте комментарии.</li>
              </ul>
            </Card>
            <Card>
              <h2>Рекомендации для куратора</h2>
              <ul>
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
