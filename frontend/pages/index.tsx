import Link from "next/link";
import Layout from "../components/Layout";

export default function HomePage() {
  return (
    <Layout>
      <section className="grid grid-2">
        <div className="grid" style={{ gap: "18px" }}>
          <span className="pill">
            Sber x SberLab-НГУ
          </span>
          <h1 className="section-title">
            Совместные проекты, где студент и куратор видят прогресс в одном окне.
          </h1>
          <p className="subtitle">
            Публикуйте кейсы, назначайте менторов и собирайте команды. Студенты видят задачи, берут в работу и
            синхронизируются по статусам.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Link href="/register" className="btn btn-primary">
              Начать сейчас
            </Link>
            <Link
              href="/tasks"
              className="btn btn-outline"
            >
              Смотреть задачи
            </Link>
          </div>
        </div>
        <div className="card">
          <h2>Что внутри MVP</h2>
          <ul className="list" style={{ marginTop: "16px" }}>
            <li>Каталог задач с фильтрами и тегами для студентов.</li>
            <li>Запросы на участие и подтверждения от ментора.</li>
            <li>Комментарии, история и статусная модель прогресса.</li>
            <li>Ролевые дашборды и упрощённый контроль задач.</li>
          </ul>
          <div className="card-soft" style={{ marginTop: "20px", fontSize: "12px" }}>
            Среднее время согласования заявки — 1 рабочий день.
          </div>
        </div>
      </section>
    </Layout>
  );
}
