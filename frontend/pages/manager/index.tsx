import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

type Dashboard = {
  total_projects: number;
  active_projects: number;
  pending_applications: number;
  students: number;
  mentors: number;
};

export default function ManagerDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Dashboard>("/manager/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Manager Dashboard</h1>
          <p>Ключевые метрики по проектам и заявкам.</p>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {data && (
          <div className={styles.grid}>
            <Card>
              <h3>Всего проектов</h3>
              <p className={styles.metric}>{data.total_projects}</p>
            </Card>
            <Card>
              <h3>Активные</h3>
              <p className={styles.metric}>{data.active_projects}</p>
            </Card>
            <Card>
              <h3>Заявки pending</h3>
              <p className={styles.metric}>{data.pending_applications}</p>
            </Card>
            <Card>
              <h3>Студенты</h3>
              <p className={styles.metric}>{data.students}</p>
            </Card>
            <Card>
              <h3>Менторы</h3>
              <p className={styles.metric}>{data.mentors}</p>
            </Card>
            <Card>
              <h3>Активность</h3>
              <div className={styles.sparkline}>
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className={styles.sparklineLabel}>7 дней · заявки</p>
            </Card>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
