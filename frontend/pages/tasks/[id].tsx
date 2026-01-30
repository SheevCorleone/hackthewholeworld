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
  goal?: string | null;
  key_tasks?: string | null;
  novelty?: string | null;
  skills_required?: string | null;
  course_alignment?: string | null;
  diploma_possible?: boolean | null;
  practice_possible?: boolean | null;
  course_project_possible?: boolean | null;
  nda_required?: boolean | null;
  status: string;
  tags?: string;
  mentor_id?: number | null;
}

interface Comment {
  id: number;
  body: string;
  author_id: number;
  created_at: string;
  is_private: boolean;
  recipient_id?: number | null;
  meeting_info?: string | null;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [questions, setQuestions] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionPrivate, setQuestionPrivate] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [meetingInfo, setMeetingInfo] = useState("");
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<Task>(`/tasks/${id}`)
      .then(setTask)
      .catch((err) => setError(err.message));
    apiRequest<Comment[]>(`/comments?task_id=${id}`)
      .then(setComments)
      .catch(() => null);
    apiRequest<Comment[]>(`/questions?task_id=${id}`)
      .then(setQuestions)
      .catch(() => null);
  }, [id]);

  const requestAssignment = async () => {
    if (!id) return;
    try {
      await apiRequest("/assignments", {
        method: "POST",
        body: JSON.stringify({ task_id: Number(id), nda_accepted: ndaAccepted })
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

  const submitQuestion = async () => {
    if (!questionBody.trim()) return;
    try {
      const newQuestion = await apiRequest<Comment>("/questions", {
        method: "POST",
        body: JSON.stringify({
          task_id: Number(id),
          body: questionBody,
          is_private: questionPrivate,
          recipient_id: recipientId ? Number(recipientId) : null,
          meeting_info: meetingInfo || null
        })
      });
      setQuestions([newQuestion, ...questions]);
      setQuestionBody("");
      setRecipientId("");
      setMeetingInfo("");
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
            {task.goal && <p className={styles.description}>Цель: {task.goal}</p>}
            {task.key_tasks && <p className={styles.description}>Ключевые задачи: {task.key_tasks}</p>}
            {task.novelty && <p className={styles.description}>Новизна: {task.novelty}</p>}
            <div className={styles.meta}>
              <span className={styles.metaPill}>Mentor: {task.mentor_id ?? "TBD"}</span>
              <span className={styles.metaPill}>Tags: {task.tags || "—"}</span>
            </div>
            <div className={styles.meta}>
              <span className={styles.metaPill}>Навыки: {task.skills_required || "—"}</span>
              <span className={styles.metaPill}>Учебная программа: {task.course_alignment || "—"}</span>
            </div>
            <div className={styles.meta}>
              <span className={styles.metaPill}>
                Диплом: {task.diploma_possible ? "да" : "нет"}
              </span>
              <span className={styles.metaPill}>
                Практика: {task.practice_possible ? "да" : "нет"}
              </span>
              <span className={styles.metaPill}>
                Курсовой: {task.course_project_possible ? "да" : "нет"}
              </span>
              <span className={styles.metaPill}>
                NDA: {task.nda_required ? "требуется" : "нет"}
              </span>
            </div>
            {task.nda_required && (
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={ndaAccepted}
                  onChange={(event) => setNdaAccepted(event.target.checked)}
                />
                Я согласен с NDA
              </label>
            )}
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

          <Card>
            <h2>Q&A</h2>
            <div className={styles.commentBox}>
              <Input
                value={questionBody}
                onChange={(event) => setQuestionBody(event.target.value)}
                placeholder="Задать вопрос"
              />
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={questionPrivate}
                  onChange={(event) => setQuestionPrivate(event.target.checked)}
                />
                Приватный вопрос
              </label>
              <Input
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
                placeholder="ID получателя (опционально)"
              />
              <Input
                value={meetingInfo}
                onChange={(event) => setMeetingInfo(event.target.value)}
                placeholder="Назначить встречу (ссылка/время)"
              />
              <Button variant="secondary" onClick={submitQuestion}>
                Отправить
              </Button>
            </div>
            <ul className={styles.commentList}>
              {questions.map((question) => (
                <Card key={question.id}>
                  <p>{question.body}</p>
                  {question.is_private && <span className={styles.metaPill}>Private</span>}
                  {question.meeting_info && (
                    <div className={styles.commentMeta}>Встреча: {question.meeting_info}</div>
                  )}
                  <span className={styles.commentMeta}>Author {question.author_id}</span>
                </Card>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </Layout>
  );
}
