import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

type PortfolioEntry = {
  id: number;
  task_id: number;
  assignment_id: number;
  summary?: string | null;
  review_rating?: number | null;
  review_comment?: string | null;
  created_at: string;
};

export default function StudentPortfolioPage() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<PortfolioEntry[]>("/portfolio/me")
      .then(setEntries)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Портфолио</h1>
          <p>Автоматически собранные записи по завершённым проектам.</p>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {entries.length === 0 && <Card>Пока нет записей в портфолио.</Card>}
        {entries.map((entry) => (
          <Card key={entry.id}>
            <strong>Проект #{entry.task_id}</strong>
            <div>Заявка #{entry.assignment_id}</div>
            <div>{entry.summary || "Без описания"}</div>
            {entry.review_rating && <div>Рейтинг: {entry.review_rating}</div>}
            {entry.review_comment && <div>Отзыв: {entry.review_comment}</div>}
          </Card>
        ))}
      </Layout>
    </RouteGuard>
  );
}
