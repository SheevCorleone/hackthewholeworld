import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { apiRequest } from "../../components/api";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string;
  mentor_id?: number | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Task[]>(`/tasks?status_filter=${statusFilter}&query=${query}`)
      .then(setTasks)
      .catch((err) => setError(err.message));
  }, [statusFilter, query]);

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Link href="/tasks/new" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm">
          Создать задачу
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          placeholder="Поиск по названию"
          className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4">
        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase">{task.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{task.description}</p>
            {task.tags && <p className="mt-2 text-xs text-slate-500">Tags: {task.tags}</p>}
          </Link>
        ))}
      </div>
    </Layout>
  );
}
