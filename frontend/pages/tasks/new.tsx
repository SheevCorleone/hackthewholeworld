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
      <h1 className="text-2xl font-semibold">Создать задачу</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs text-slate-500">Заголовок</label>
          <input name="title" placeholder="Новый кейс" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
        </div>
        <div>
          <label className="text-xs text-slate-500">Описание</label>
          <textarea name="description" placeholder="Опишите цель и ожидаемый результат" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" rows={6} required />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-500">Теги</label>
            <input name="tags" placeholder="ml, analytics" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-500">ID ментора</label>
            <input name="mentor_id" placeholder="123" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">Deadline</label>
          <input name="deadline" placeholder="Deadline" type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm">
          Сохранить
        </button>
      </form>
    </Layout>
  );
}
