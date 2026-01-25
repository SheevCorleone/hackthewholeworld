import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import Card from "../../components/Card";
import ErrorText from "../../components/ErrorText";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import { apiRequest } from "../../components/api";

export default function NewTaskPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const task = await apiRequest<{ id: number }>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          tags: form.get("tags"),
          deadline: form.get("deadline") || null,
          mentor_id: form.get("mentor_id") ? Number(form.get("mentor_id")) : null
        })
      });
      router.push(`/tasks/${task.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Создать задачу</h1>
      <Card style={{ marginTop: "20px" }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <Input name="title" label="Заголовок" placeholder="Новый кейс" required />
          <Textarea name="description" label="Описание" placeholder="Опишите цель и ожидаемый результат" rows={6} required />
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <Input name="tags" label="Теги" placeholder="ml, analytics" />
            <Input name="mentor_id" label="ID ментора" placeholder="123" />
          </div>
          <Input name="deadline" type="date" label="Deadline" />
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit">Сохранить</Button>
        </form>
      </Card>
    </Layout>
  );
}
