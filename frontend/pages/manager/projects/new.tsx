import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Input from "../../../components/Input";
import Textarea from "../../../components/Textarea";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

export default function ManagerNewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const project = await apiRequest<{ id: number }>("/manager/projects", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          tags: form.get("tags"),
          deadline: form.get("deadline") || null,
          status: form.get("status") || "open"
        })
      });
      router.push(`/manager/projects/${project.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <h1 className={styles.title}>Создать проект</h1>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <Input name="title" label="Название проекта" required />
          <Textarea name="description" label="Описание" rows={6} required />
          <div className={styles.gridTwo}>
            <Input name="tags" label="Теги" placeholder="analytics, ml" />
            <Input name="deadline" label="Deadline" type="date" />
          </div>
          <Input name="status" label="Статус" placeholder="open / in_progress / completed" />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={loading}>
            Создать
          </Button>
        </form>
      </Layout>
    </RouteGuard>
  );
}
