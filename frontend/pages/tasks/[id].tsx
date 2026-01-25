import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import ErrorText from "../../components/ErrorText";
import Input from "../../components/Input";
import { apiRequest } from "../../components/api";
import styles from "../../styles/TaskDetail.module.css";

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
      {error && <ErrorText>{error}</ErrorText>}
      {task && (
        <div className={styles.wrapper}>
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>{task.title}</h1>
              <Badge tone="sber">{task.status}</Badge>
            </div>
            <p className={styles.description}>{task.description}</p>
            <div className={styles.meta}>
              <Badge tone="neutral">Mentor: {task.mentor_id ?? "TBD"}</Badge>
              <Badge tone="neutral">Tags: {task.tags || "—"}</Badge>
            </div>
            <Button onClick={requestAssignment} style={{ marginTop: "16px" }}>
              Взять в работу
            </Button>
          </Card>

          <Card>
            <h2>Комментарии</h2>
            <div className={styles.commentBox}>
              <Input
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Оставить комментарий"
              />
              <Button variant="secondary" onClick={submitComment}>
                Отправить
              </Button>
            </div>
            <ul className={styles.commentList}>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <Card style={{ background: "#f8faf9" }}>
                    <p>{comment.body}</p>
                    <span style={{ fontSize: "12px", color: "var(--muted-600)" }}>Author {comment.author_id}</span>
                  </Card>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </Layout>
  );
}
