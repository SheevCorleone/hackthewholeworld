import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
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
      <h1 className="section-title" style={{ fontSize: "26px" }}>Создать задачу</h1>
      <form onSubmit={handleSubmit} className="card" style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
        <div>
          <label className="label">Заголовок</label>
          <input name="title" placeholder="Новый кейс" className="input" required />
        </div>
        <div>
          <label className="label">Описание</label>
          <textarea name="description" placeholder="Опишите цель и ожидаемый результат" className="textarea" rows={6} required />
        </div>
        <div className="grid grid-2">
          <div>
            <label className="label">Теги</label>
            <input name="tags" placeholder="ml, analytics" className="input" />
          </div>
          <div>
            <label className="label">ID ментора</label>
            <input name="mentor_id" placeholder="123" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Deadline</label>
          <input name="deadline" placeholder="Deadline" type="date" className="input" />
        </div>
        {error && <p className="muted">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Сохранить
        </button>
      </form>
    </Layout>
  );
}
