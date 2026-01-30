import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Textarea from "../../components/Textarea";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

type Approval = {
  id: number;
  task_id: number;
  type: string;
  state: string;
  comment?: string | null;
  requested_by: number;
  reviewer_id?: number | null;
};

export default function UnivApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = () => {
    apiRequest<Approval[]>("/univ/approvals")
      .then(setApprovals)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const updateApproval = async (approvalId: number, state: string) => {
    try {
      await apiRequest(`/univ/approvals/${approvalId}`, {
        method: "PATCH",
        body: JSON.stringify({
          state,
          comment: comments[approvalId] || null
        })
      });
      loadApprovals();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["univ_teacher", "univ_supervisor", "univ_admin"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Согласования</h1>
          <p>Заявки на диплом/практику/курсовые.</p>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {approvals.length === 0 && <Card>Нет заявок на согласование.</Card>}
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <strong>Проект #{approval.task_id}</strong>
            <div>Тип: {approval.type}</div>
            <div>Статус: {approval.state}</div>
            <div>Студент: {approval.requested_by}</div>
            <Textarea
              name={`comment-${approval.id}`}
              label="Комментарий"
              rows={2}
              value={comments[approval.id] || ""}
              onChange={(event) =>
                setComments((prev) => ({ ...prev, [approval.id]: event.target.value }))
              }
            />
            <div className={styles.toolbar}>
              <Button size="sm" onClick={() => updateApproval(approval.id, "approved")}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => updateApproval(approval.id, "needs_changes")}>
                Needs changes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updateApproval(approval.id, "rejected")}>
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </Layout>
    </RouteGuard>
  );
}
