import { useState } from "react";
import { validateStudentFields } from "../../utils/validation";
import Button from "../common/Button";
import Modal from "../common/Modal";

// UPDATE form shown in a dialog, pre-filled with the selected student's current details.
export default function EditStudentModal({ student, onSave, onClose }) {
  const [values, setValues] = useState({ name: student.name, email: student.email, course: student.course });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateStudentFields(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSave(student.id, { name: values.name.trim(), email: values.email.trim(), course: values.course.trim() });
    } catch (error) {
      setErrors(error.status === 409 ? { email: error.message } : { form: error.message });
      setSaving(false);
    }
  };

  const field = (name, label, type = "text") => (
    <div className="field">
      <label htmlFor={`edit-${name}`}>{label}</label>
      <input
        id={`edit-${name}`}
        name={name}
        type={type}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `edit-${name}-error` : undefined}
      />
      {errors[name] && (
        <p className="field__error" id={`edit-${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <Modal title="Edit student" description={`Student ID ${student.id}`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="modal__form">
        {field("name", "Full name")}
        {field("email", "Email address", "email")}
        {field("course", "Course")}
        {errors.form && (
          <p className="field__error" role="alert">
            {errors.form}
          </p>
        )}
        <div className="modal__footer">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? "Saving" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
