import { useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";

// DELETE confirmation: names the selected student before anything is removed.
export default function DeleteConfirmation({ student, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await onConfirm(student);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <Modal title="Delete this student?" onClose={onClose} size="sm">
      <div className="modal__form">
        <p className="delete-summary">
          <strong>{student.name}</strong>
          <span>{student.email}</span>
          <span>
            {student.course} · ID {student.id}
          </span>
        </p>
        <p>This permanently removes the record from the database. It can't be undone.</p>
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        <div className="modal__footer">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleConfirm}>
            {deleting ? "Deleting" : "Delete student"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
