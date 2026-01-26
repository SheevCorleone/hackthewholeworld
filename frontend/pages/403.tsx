import Link from "next/link";
import Layout from "../components/Layout";
import Button from "../components/Button";
import styles from "../styles/EmptyState.module.css";

export default function ForbiddenPage() {
  return (
    <Layout>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1>Нет доступа</h1>
          <p>У вашей роли нет прав на эту страницу. Вернитесь на доступный раздел.</p>
          <Link href="/">
            <Button>На главную</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
