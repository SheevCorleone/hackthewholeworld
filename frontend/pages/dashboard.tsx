import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";

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
      <h1 className="section-title" style={{ fontSize: "26px" }}>Dashboard</h1>
      {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}
      {user && (
        <div className="card" style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <p className="label">Logged in</p>
              <p style={{ fontSize: "18px", fontWeight: 600 }}>{user.full_name}</p>
              <p className="subtitle">Role: {user.role}</p>
            </div>
            <div className="pill">
              Синхронизация активна · 100%
            </div>
          </div>
          <div className="grid grid-2" style={{ marginTop: "24px" }}>
            <div className="card-soft">
              <h2>Следующие шаги</h2>
              <ul className="list" style={{ marginTop: "12px" }}>
                <li>Проверьте открытые задачи и выберите релевантный кейс.</li>
                <li>Запросите участие и ожидайте подтверждения ментора.</li>
                <li>Обновляйте статус и оставляйте комментарии.</li>
              </ul>
            </div>
            <div className="card-soft">
              <h2>Рекомендации для куратора</h2>
              <ul className="list" style={{ marginTop: "12px" }}>
                <li>Создайте новый кейс и назначьте ментора.</li>
                <li>Соберите команды и утвердите заявки.</li>
                <li>Закройте кейс с итоговым статусом.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
