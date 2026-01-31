import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Manager.module.css";

type Curator = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

export default function ManagerCuratorsPage() {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadCurators = async () => {
    try {
      const data = await apiRequest<Curator[]>("/manager/curators");
      setCurators(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadCurators();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return curators;
    return curators.filter((curator) => {
      return (
        curator.full_name.toLowerCase().includes(q) ||
        curator.email.toLowerCase().includes(q)
      );
    });
  }, [curators, query]);

  const removeCurator = async (curatorId: number) => {
    const ok = window.confirm("Удалить куратора? Доступ будет отключён.");
    if (!ok) return;
    try {
      await apiRequest(`/manager/curators/${curatorId}`, { method: "DELETE" });
      loadCurators();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <div className={styles.toolbar}>
          <div>
            <h1 className={styles.sectionTitle}>Кураторы</h1>
            <p>Список активных кураторов.</p>
          </div>
          <Link href="/manager/curators/new">
            <Button>Создать куратора</Button>
          </Link>
        </div>
        <div className={styles.searchRow}>
          <input
            className={styles.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по имени или email"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.grid}>
          {filtered.map((curator) => (
            <Card key={curator.id}>
              <h3>{curator.full_name}</h3>
              <p>{curator.email}</p>
              <div className={styles.toolbar}>
                <span className={styles.pill}>Curator</span>
                <Button size="sm" variant="danger" onClick={() => removeCurator(curator.id)}>
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
