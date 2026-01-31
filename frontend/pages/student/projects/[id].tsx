import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

type Project = {
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
  tags?: string | null;
  is_archived?: boolean;
  curator_full_name?: string | null;
  mentor_full_name?: string | null;
  mentor_names?: string[] | null;
};

type Question = {
  id: number;
  body: string;
  author_id: number;
  is_private: boolean;
  meeting_info?: string | null;
};

type TeamMember = {
  user_id: number;
  full_name: string;
  role_in_team?: string | null;
  contact_email?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
};

type Assignment = {
  id: number;
  task_id: number;
  state: string;
};

export default function StudentProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [questionBody, setQuestionBody] = useState("");
  const [questionPrivate, setQuestionPrivate] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [meetingInfo, setMeetingInfo] = useState("");

  useEffect(() => {
    if (!id) return;
    apiRequest<Project>(`/projects/${id}`)
      .then(setProject)
      .catch((err) => setError(err.message));
    apiRequest<Question[]>(`/questions?task_id=${id}`).then(setQuestions).catch(() => null);
    apiRequest<TeamMember[]>(`/projects/${id}/team`).then(setTeam).catch(() => null);
    apiRequest<Assignment[]>("/assignments/me")
      .then((data) => {
        const found = data.find((item) => item.task_id === Number(id));
        setAssignment(found || null);
      })
      .catch(() => null);
  }, [id]);

  const statusLabel = (state?: string | null) => {
    if (!state) return null;
    if (state === "requested") return "pending";
    if (state === "active" || state === "done") return "approved";
    if (state === "canceled") return "rejected";
    return state;
  };

  const mentorLabel = project?.mentor_names?.length
    ? project.mentor_names.join(", ")
    : project?.mentor_full_name || "—";

  const apply = async () => {
    if (!id) return;
    setMessage(null);
    try {
      await apiRequest(`/projects/${id}/applications`, {
        method: "POST",
        body: JSON.stringify({ nda_accepted: ndaAccepted })
      });
      setMessage("Заявка отправлена. Ожидайте решения менеджера.");
      setAssignment({ id: Date.now(), task_id: Number(id), state: "requested" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const submitQuestion = async () => {
    if (!questionBody.trim()) return;
    try {
      const newQuestion = await apiRequest<Question>("/questions", {
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
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {project && (
          <div className={styles.wrapper}>
            <div className={styles.detailGrid}>
              <Card className={styles.detailCard}>
                <div className={styles.header}>
                  <h1 className={styles.title}>{project.title}</h1>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <div className={styles.meta}>
                  {project.is_archived && (
                    <span className={`${styles.metaPill} ${styles.badgeArchived}`}>Архив</span>
                  )}
                  {project.tags && <span className={styles.tagPill}>{project.tags}</span>}
                  {project.skills_required && <span className={styles.metaPill}>Навыки: {project.skills_required}</span>}
                  {project.course_alignment && (
                    <span className={styles.metaPill}>Программа: {project.course_alignment}</span>
                  )}
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Описание</h3>
                  <p className={styles.sectionBody}>{project.description}</p>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Цели</h3>
                  <p className={styles.sectionBody}>{project.goal || "—"}</p>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Задачи</h3>
                  <p className={styles.sectionBody}>{project.key_tasks || "—"}</p>
                </div>
                <div className={styles.meta}>
                  <span className={styles.metaPill}>
                    Диплом: {project.diploma_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    Практика: {project.practice_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    Курсовой: {project.course_project_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    NDA: {project.nda_required ? "требуется" : "нет"}
                  </span>
                </div>
                {project.nda_required && (
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={ndaAccepted}
                      onChange={(event) => setNdaAccepted(event.target.checked)}
                    />
                    Я согласен с NDA
                  </label>
                )}
                <div className={styles.meta}>
                  <span className={styles.metaPill}>
                    Статус заявки: {statusLabel(assignment?.state) || "нет заявки"}
                  </span>
                </div>
                <div className={styles.ctaRow}>
                  <Button onClick={apply} disabled={Boolean(assignment)}>
                    {assignment ? "Заявка отправлена" : "Подать заявку"}
                  </Button>
                </div>
                {message && <p className={styles.metaPill}>{message}</p>}
              </Card>
              <div className={styles.infoCard}>
                <p className={styles.infoTitle}>Куратор</p>
                <p className={styles.infoValue}>{project.curator_full_name || "—"}</p>
                <p className={styles.infoTitle}>Ментор(ы)</p>
                <p className={styles.infoValue}>{mentorLabel}</p>
                <p className={styles.infoTitle}>Теги/цели</p>
                <p className={styles.infoValue}>{project.tags || project.goal || "—"}</p>
              </div>
            </div>
            <Card>
              <h2>Команда проекта</h2>
              {team.length === 0 && <p>Команда пока не сформирована.</p>}
              {team.length > 0 && (
                <ul className={styles.commentList}>
                  {team.map((member) => (
                    <Card key={member.user_id}>
                      <strong>{member.full_name}</strong>
                      {member.role_in_team && <div>Роль: {member.role_in_team}</div>}
                      <div>Email: {member.contact_email || "Доступ после подтверждения"}</div>
                      {member.linkedin_url && <div>LinkedIn: {member.linkedin_url}</div>}
                      {member.github_url && <div>GitHub: {member.github_url}</div>}
                    </Card>
                  ))}
                </ul>
              )}
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
    </RouteGuard>
  );
}
