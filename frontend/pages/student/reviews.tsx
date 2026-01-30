import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

export default function StudentReviewsPage() {
  const [reviews, setReviews] = useState<{ id: number; rating: number; comment?: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ id: number; rating: number; comment?: string | null }[]>("/reviews/me")
      .then(setReviews)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Рецензии</h1>
          <p>Отзывы по выполненным проектам.</p>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {reviews.length === 0 && (
          <Card>
            <p>Рецензии будут отображаться после завершения проекта.</p>
          </Card>
        )}
        {reviews.map((review) => (
          <Card key={review.id}>
            <strong>Оценка: {review.rating}</strong>
            <div>{review.comment || "Без комментария"}</div>
          </Card>
        ))}
      </Layout>
    </RouteGuard>
  );
}
