import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Manager.module.css";

type Mentor = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

export default function ManagerMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Mentor[]>("/manager/mentors")
      .then(setMentors)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <div className={styles.toolbar}>
          <div>
            <h1 className={styles.sectionTitle}>Менторы</h1>
            <p>Список назначенных менторов.</p>
          </div>
          <Link href="/manager/mentors/new">
            <Button>Создать ментора</Button>
          </Link>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.grid}>
          {mentors.map((mentor) => (
            <Card key={mentor.id}>
              <h3>{mentor.full_name}</h3>
              <p>{mentor.email}</p>
              <span className={styles.pill}>Mentor</span>
            </Card>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
