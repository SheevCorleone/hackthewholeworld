import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

interface Comment {
  id: number;
  body: string;
  author_id: number;
  created_at: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<Task>(`/tasks/${id}`)
      .then(setTask)
      .catch((err) => setError(err.message));
    apiRequest<Comment[]>(`/comments?task_id=${id}`)
      .then(setComments)
      .catch(() => null);
  }, [id]);

  const requestAssignment = async () => {
    if (!id) return;
    try {
      await apiRequest("/assignments", {
        method: "POST",
        body: JSON.stringify({ task_id: Number(id) })
      });
      alert("Запрос отправлен");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const submitComment = async () => {
    if (!commentBody.trim()) return;
    try {
      const newComment = await apiRequest<Comment>("/comments", {
        method: "POST",
        body: JSON.stringify({ task_id: Number(id), body: commentBody })
      });
      setComments([newComment, ...comments]);
      setCommentBody("");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <Layout>
      {error && <p className="text-red-600">{error}</p>}
      {task && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">{task.title}</h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase">{task.status}</span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{task.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 px-3 py-1">Mentor: {task.mentor_id ?? "TBD"}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Tags: {task.tags || "—"}</span>
            </div>
            <button onClick={requestAssignment} className="mt-6 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm">
              Взять в работу
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Комментарии</h2>
            <div className="mt-4 flex gap-2">
              <input
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Оставить комментарий"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button onClick={submitComment} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Отправить
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded-xl border border-slate-200 p-3">
                  <p>{comment.body}</p>
                  <span className="text-xs text-slate-400">Author {comment.author_id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}
