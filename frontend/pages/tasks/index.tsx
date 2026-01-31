import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { apiRequest } from "../../components/api";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import styles from "../../styles/Tasks.module.css";

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
      <div className={styles.header}>
        <h1 className={styles.title}>Tasks</h1>
        <Link href="/tasks/new">
          <Button>Создать задачу</Button>
        </Link>
      </div>
      <div className={styles.filters}>
        <Input
          placeholder="Поиск по названию"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </Select>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.list}>
        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{task.title}</h2>
                <span className={styles.status}>{task.status}</span>
              </div>
              <p className={styles.cardBody}>{task.description}</p>
              {task.tags && <p className={styles.cardMeta}>Tags: {task.tags}</p>}
            </Card>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
