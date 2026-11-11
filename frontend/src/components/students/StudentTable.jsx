import { formatDate, formatShortDate } from "../../utils/formatDate";
import Button from "../common/Button";
import Loader from "../common/Loader";

// READ view: loading, error, empty and results states.
export default function StudentTable({ students, totalCount, loading, error, searchTerm, onRetry, onEdit, onDelete }) {
  if (loading) return <Loader label="Loading students from the database…" />;

  if (error) {
    return (
      <div className="sis-state sis-state--error" role="alert">
        <h4>Couldn't load students</h4>
        <p>{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="sis-state">
        <h4>No students yet</h4>
        <p>The database has no student records. Use the form to register the first one.</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="sis-state">
        <h4>No matches</h4>
        <p>No student matches “{searchTerm}”. Try a different name, email or course.</p>
      </div>
    );
  }

  return (
    <div className="sis-table-wrap">
      <table className="sis-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Full name</th>
            <th scope="col">Email</th>
            <th scope="col">Course</th>
            <th scope="col">Registered</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td data-label="ID">{student.id}</td>
              <td data-label="Full name">{student.name}</td>
              <td data-label="Email" className="sis-table__email">
                {student.email}
              </td>
              <td data-label="Course">{student.course}</td>
              <td data-label="Registered" title={formatDate(student.createdAt)}>
                {formatShortDate(student.createdAt)}
              </td>
              <td data-label="Actions">
                <div className="sis-table__actions">
                  <Button variant="outline" onClick={() => onEdit(student)} aria-label={`Edit ${student.name}`}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(student)} aria-label={`Delete ${student.name}`}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
