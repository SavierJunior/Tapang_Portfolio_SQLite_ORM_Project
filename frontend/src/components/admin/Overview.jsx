import { useEffect, useState } from "react";
import { getAdminSettings, listMessages, listProjects } from "../../services/adminService";
import { formatShortDate } from "../../utils/formatDate";
import Loader from "../common/Loader";

export default function Overview({ onOpenTab }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listProjects(), getAdminSettings(), listMessages()])
      .then(([projects, settings, messages]) => active && setData({ projects, settings, messages }))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className="form-status form-status--error" role="alert">{error}</p>;
  if (!data) return <Loader label="Loading overview..." />;

  const { projects, settings, messages } = data;
  const published = projects.filter((project) => project.status === "PUBLISHED").length;
  const latest = messages.messages.slice(0, 4);

  const cards = [
    { tab: "projects", label: "Published projects", value: published, note: `${projects.length - published} draft${projects.length - published === 1 ? "" : "s"}` },
    { tab: "messages", label: "New messages", value: messages.counts.PENDING, note: `${messages.counts.ALL} in total` },
    { tab: "profile", label: "Profile picture", value: settings.profileImageUrl ? "Custom" : "Original", note: "Shown in the hero section" },
    { tab: "resume", label: "Resume", value: settings.resume ? "Replaced" : "Original", note: settings.resume ? `Uploaded ${formatShortDate(settings.resume.uploadedAt)}` : "Using the bundled resume.pdf" },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Overview</h1>
          <p>A quick look at your portfolio content.</p>
        </div>
      </header>

      <ul className="admin-stats">
        {cards.map((card) => (
          <li key={card.label}>
            <button type="button" onClick={() => onOpenTab(card.tab)}>
              <small>{card.label}</small>
              <strong>{card.value}</strong>
              <span>{card.note}</span>
            </button>
          </li>
        ))}
      </ul>

      <section className="admin-card">
        <h2>Latest messages</h2>
        {latest.length === 0 ? (
          <p className="admin-empty">No messages yet.</p>
        ) : (
          <ul className="admin-latest">
            {latest.map((message) => (
              <li key={message.id}>
                <div>
                  <strong>{message.subject}</strong>
                  <small>
                    {message.senderName} · {formatShortDate(message.createdAt)}
                  </small>
                </div>
                <span className={`status-pill status-pill--${message.status.toLowerCase()}`}>{message.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
