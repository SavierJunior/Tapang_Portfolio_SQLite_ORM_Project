export default function StudentSearch({ value, onChange, shown, total }) {
  return (
    <div className="sis-search">
      <label htmlFor="student-search">Search students</label>
      <div className="sis-search__box">
        <input
          id="student-search"
          type="search"
          placeholder="Name, email or course"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>
      <p className="sis-search__count" aria-live="polite">
        {value ? `Showing ${shown} of ${total}` : `${total} ${total === 1 ? "student" : "students"}`}
      </p>
    </div>
  );
}
