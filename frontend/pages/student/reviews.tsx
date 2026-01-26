import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import styles from "../../styles/Manager.module.css";

export default function StudentReviewsPage() {
  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Рецензии</h1>
          <p>Отзывы по выполненным проектам.</p>
        </div>
        <Card>
          <p>Рецензии будут отображаться после завершения проекта.</p>
        </Card>
      </Layout>
    </RouteGuard>
  );
}
