import { useCallback, useEffect, useState } from "react";
import * as studentService from "../services/studentService";

// Holds the student list that was loaded from SQLite (through the API) plus the CRUD actions.
// Every successful change re-fetches the list so the database stays the source of truth.
export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch-on-mount: state is only set after the awaited request finishes.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const retry = useCallback(async () => {
    setLoading(true);
    await loadStudents();
  }, [loadStudents]);

  // The three actions below throw on failure so the calling form can show the message.
  const addStudent = useCallback(
    async (values) => {
      const created = await studentService.createStudent(values);
      await loadStudents();
      return created;
    },
    [loadStudents]
  );

  const editStudent = useCallback(
    async (id, values) => {
      const updated = await studentService.updateStudent(id, values);
      await loadStudents();
      return updated;
    },
    [loadStudents]
  );

  const removeStudent = useCallback(
    async (id) => {
      await studentService.deleteStudent(id);
      await loadStudents();
    },
    [loadStudents]
  );

  return { students, loading, error, retry, addStudent, editStudent, removeStudent };
}
