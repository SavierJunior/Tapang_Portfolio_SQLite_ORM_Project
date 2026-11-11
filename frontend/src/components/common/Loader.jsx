export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader" role="status">
      <span className="loader__ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
