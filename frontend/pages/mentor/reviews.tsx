import { FormEvent, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

export default function MentorReviewsPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({
          assignment_id: Number(form.get("assignment_id")),
          rating: Number(form.get("rating")),
          comment: form.get("comment")
        })
      });
      setMessage("Отзыв сохранён.");
      event.currentTarget.reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["mentor"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Рецензии</h1>
          <p>Обратная связь и участие в оценке.</p>
        </div>
        <Card>
          <form onSubmit={submitReview} className={styles.stack}>
            <Input name="assignment_id" label="ID заявки" placeholder="123" required />
            <Input name="rating" label="Оценка (1-5)" type="number" min={1} max={5} required />
            <Textarea name="comment" label="Комментарий" rows={3} />
            {error && <p className={styles.error}>{error}</p>}
            {message && <p>{message}</p>}
            <Button type="submit">Отправить отзыв</Button>
          </form>
        </Card>
      </Layout>
    </RouteGuard>
  );
}
