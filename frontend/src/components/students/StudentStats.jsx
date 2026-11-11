import { formatShortDate } from "../../utils/formatDate";

export default function StudentStats({ students, loading }) {
  const courses = new Set(students.map((s) => s.course.trim().toLowerCase())).size;
  const latest = students.reduce((a, s) => (!a || new Date(s.createdAt) > new Date(a.createdAt) ? s : a), null);

  const stats = [
    { label: "Total students", value: loading ? "…" : students.length },
    { label: "Courses", value: loading ? "…" : courses },
    { label: "Latest registration", value: loading || !latest ? "—" : formatShortDate(latest.createdAt), small: true },
  ];

  return (
    <dl className="sis-stats">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt>{stat.label}</dt>
          <dd className={stat.small ? "is-small" : ""}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
