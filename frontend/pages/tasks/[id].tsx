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
      {error && <p className="muted">{error}</p>}
      {task && (
        <div className="grid" style={{ gap: "24px" }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h1 className="section-title" style={{ fontSize: "24px" }}>{task.title}</h1>
              <span className="badge">{task.status}</span>
            </div>
            <p className="subtitle" style={{ marginTop: "12px" }}>{task.description}</p>
            <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <span className="pill">Mentor: {task.mentor_id ?? "TBD"}</span>
              <span className="pill">Tags: {task.tags || "—"}</span>
            </div>
            <button onClick={requestAssignment} className="btn btn-primary" style={{ marginTop: "16px" }}>
              Взять в работу
            </button>
          </div>

          <div className="card">
            <h2>Комментарии</h2>
            <div style={{ marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Оставить комментарий"
                className="input"
              />
              <button onClick={submitComment} className="btn btn-outline">
                Отправить
              </button>
            </div>
            <ul className="grid" style={{ marginTop: "16px", gap: "12px" }}>
              {comments.map((comment) => (
                <li key={comment.id} className="card-soft">
                  <p>{comment.body}</p>
                  <span className="muted" style={{ fontSize: "12px" }}>Author {comment.author_id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}
