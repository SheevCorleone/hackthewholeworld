import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import styles from "../../styles/Manager.module.css";

export default function MentorReviewsPage() {
  return (
    <RouteGuard roles={["mentor"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Рецензии</h1>
          <p>Обратная связь и участие в оценке.</p>
        </div>
        <Card>
          <p>Добавьте комментарии и оценку по завершённым проектам.</p>
        </Card>
      </Layout>
    </RouteGuard>
  );
}
