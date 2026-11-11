// Generated preview used when a project has no uploaded cover image yet.
export default function ProjectPreview({ title, category, variant = 0 }) {
  const initials = title
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return (
    <div className={`project-preview project-preview--${variant % 3}`} aria-hidden="true">
      <span className="project-preview__shape project-preview__shape--a" />
      <span className="project-preview__shape project-preview__shape--b" />
      <span className="project-preview__initials">{initials}</span>
      <span className="project-preview__type">{category}</span>
    </div>
  );
}
