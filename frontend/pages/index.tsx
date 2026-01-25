import Link from "next/link";
import Layout from "../components/Layout";

export default function HomePage() {
  return (
    <Layout>
      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Sber x SberLab-НГУ
          </span>
          <h1 className="text-4xl font-semibold leading-tight">
            Совместные проекты, где студент и куратор видят прогресс в одном окне.
          </h1>
          <p className="text-slate-600">
            Публикуйте кейсы, назначайте менторов и собирайте команды. Студенты видят задачи, берут в работу и
            синхронизируются по статусам.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm">
              Начать сейчас
            </Link>
            <Link
              href="/tasks"
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              Смотреть задачи
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Что внутри MVP</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Каталог задач с фильтрами и тегами для студентов.</li>
            <li>Запросы на участие и подтверждения от ментора.</li>
            <li>Комментарии, история и статусная модель прогресса.</li>
            <li>Ролевые дашборды и упрощённый контроль задач.</li>
          </ul>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            Среднее время согласования заявки — 1 рабочий день.
          </div>
        </div>
      </section>
    </Layout>
  );
}
