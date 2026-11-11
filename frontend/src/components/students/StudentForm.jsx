import { useState } from "react";
import { validateStudentFields } from "../../utils/validation";
import Button from "../common/Button";

const empty = { name: "", email: "", course: "" };

// Registration form (CREATE). `onSubmit` must resolve only after the API confirms the save.
export default function StudentForm({ onSubmit }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      await onSubmit({ name: values.name.trim(), email: values.email.trim(), course: values.course.trim() });
      setValues(empty);
    } catch (error) {
      // Duplicate email (409) belongs on the email field; everything else is shown by the dashboard toast.
      if (error.status === 409) setErrors({ email: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`student-${name}`}>{label}</label>
      <input
        id={`student-${name}`}
        name={name}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `student-${name}-error` : undefined}
        {...props}
      />
      {errors[name] && (
        <p className="field__error" id={`student-${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form className="sis-card sis-form" onSubmit={handleSubmit} noValidate>
      <h3>Register a student</h3>
      <p className="sis-card__hint">Saved to the SQLite database through Express and Prisma.</p>
      {field("name", "Full name", { type: "text", placeholder: "Juan Dela Cruz", autoComplete: "off" })}
      {field("email", "Email address", { type: "email", placeholder: "juan@example.com", autoComplete: "off" })}
      {field("course", "Course", { type: "text", placeholder: "e.g., BSIT", autoComplete: "off" })}
      <Button type="submit" variant="primary" loading={submitting}>
        {submitting ? "Saving" : "Save student"}
      </Button>
    </form>
  );
}
