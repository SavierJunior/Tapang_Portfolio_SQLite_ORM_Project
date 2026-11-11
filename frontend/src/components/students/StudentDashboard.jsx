import { useCallback, useMemo, useState } from "react";
import { useStudents } from "../../hooks/useStudents";
import Notification from "../common/Notification";
import DeleteConfirmation from "./DeleteConfirmation";
import EditStudentModal from "./EditStudentModal";
import StudentForm from "./StudentForm";
import StudentSearch from "./StudentSearch";
import StudentStats from "./StudentStats";
import StudentTable from "./StudentTable";

// Coordinates the Student Information System: data (useStudents), dialogs and notifications.
export default function StudentDashboard() {
  const { students, loading, error, retry, addStudent, editStudent, removeStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notification, setNotification] = useState(null);

  const dismiss = useCallback(() => setNotification(null), []);
  const notify = (type, message) => setNotification({ id: Date.now(), type, message });

  const visibleStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) => [s.name, s.email, s.course].some((value) => value.toLowerCase().includes(term)));
  }, [students, searchTerm]);

  // Success toasts run only after the API call resolved. Failures are rethrown so forms can react.
  const handleCreate = async (values) => {
    try {
      const created = await addStudent(values);
      notify("success", `${created.name} was added to the database.`);
    } catch (err) {
      notify("error", err.message);
      throw err;
    }
  };

  const handleUpdate = async (id, values) => {
    try {
      const updated = await editStudent(id, values);
      setEditing(null);
      notify("success", `${updated.name} was updated.`);
    } catch (err) {
      if (err.status !== 409) notify("error", err.message);
      throw err;
    }
  };

  const handleDelete = async (student) => {
    try {
      await removeStudent(student.id);
      setDeleting(null);
      notify("success", `${student.name} was deleted.`);
    } catch (err) {
      notify("error", err.message);
      throw err;
    }
  };

  return (
    <div className="sis-dashboard">
      <StudentStats students={students} loading={loading} />

      <div className="sis-layout">
        <StudentForm onSubmit={handleCreate} />

        <section className="sis-card sis-records" aria-labelledby="records-title">
          <div className="sis-records__head">
            <h3 id="records-title">Student records</h3>
            <StudentSearch
              value={searchTerm}
              onChange={setSearchTerm}
              shown={visibleStudents.length}
              total={students.length}
            />
          </div>
          <StudentTable
            students={visibleStudents}
            totalCount={students.length}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            onRetry={retry}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        </section>
      </div>

      {editing && <EditStudentModal student={editing} onSave={handleUpdate} onClose={() => setEditing(null)} />}
      {deleting && (
        <DeleteConfirmation student={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />
      )}
      <Notification notification={notification} onDismiss={dismiss} />
    </div>
  );
}
