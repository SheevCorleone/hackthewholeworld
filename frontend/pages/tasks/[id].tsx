import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiRequest } from "../../components/api";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
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
      {error && <p className={styles.error}>{error}</p>}
      {task && (
        <div className={styles.wrapper}>
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>{task.title}</h1>
              <span className={styles.status}>{task.status}</span>
            </div>
            <p className={styles.description}>{task.description}</p>
            <div className={styles.meta}>
              <span className={styles.metaPill}>Mentor: {task.mentor_id ?? "TBD"}</span>
              <span className={styles.metaPill}>Tags: {task.tags || "—"}</span>
            </div>
            <Button onClick={requestAssignment}>Взять в работу</Button>
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
                <Card key={comment.id}>
                  <p>{comment.body}</p>
                  <span className={styles.commentMeta}>Author {comment.author_id}</span>
                </Card>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </Layout>
  );
}
