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
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {user && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Logged in</p>
              <p className="text-lg font-semibold">{user.full_name}</p>
              <p className="text-sm text-slate-500">Role: {user.role}</p>
            </div>
            <div className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-500">
              Синхронизация активна · 100%
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="font-semibold">Следующие шаги</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Проверьте открытые задачи и выберите релевантный кейс.</li>
                <li>Запросите участие и ожидайте подтверждения ментора.</li>
                <li>Обновляйте статус и оставляйте комментарии.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="font-semibold">Рекомендации для куратора</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
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
