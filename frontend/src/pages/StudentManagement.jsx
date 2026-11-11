import StudentDashboard from "../components/students/StudentDashboard";
import "../styles/StudentManagement.css";

export default function StudentManagement() {
  return (
    <section id="students" className="section sis">
      <div className="container sis__container">
        <header className="sis__header">
          <p className="section-label">
            <span>SIS</span>Student Information System
          </p>
          <h1 className="section-title">
            Student records,
            <br />
            <span>stored in SQLite.</span>
          </h1>
          <p className="sis__intro">
            Add, view, edit and delete students. Every change goes from React to an Express API, then through Prisma
            ORM into the database.
          </p>
        </header>
        <StudentDashboard />
      </div>
    </section>
  );
}
