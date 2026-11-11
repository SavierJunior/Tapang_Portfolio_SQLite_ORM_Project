import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { listMessages } from "../../services/adminService";
import Button from "../common/Button";
import Notification from "../common/Notification";
import MessagesManager from "./MessagesManager";
import Overview from "./Overview";
import ProfileSettings from "./ProfileSettings";
import ProjectsManager from "./ProjectsManager";
import ResumeSettings from "./ResumeSettings";

const TABS = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "projects", label: "Projects", icon: "▦" },
  { id: "profile", label: "Profile picture", icon: "◉" },
  { id: "resume", label: "Resume", icon: "▤" },
  { id: "messages", label: "Messages", icon: "✉" },
];

export default function AdminDashboard({ onNavigate }) {
  const { admin, signOut } = useAuth();
  const { profileImage } = useSiteSettings();
  const [tab, setTab] = useState("overview");
  const [notification, setNotification] = useState(null);
  const [pending, setPending] = useState(0);

  const notify = useCallback((type, message) => setNotification({ type, message }), []);
  const dismiss = useCallback(() => setNotification(null), []);

  // Unread badge on the Messages tab.
  useEffect(() => {
    let active = true;
    listMessages()
      .then((data) => active && setPending(data.counts.PENDING))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-side__brand">
          <span className="brand-logo">AT</span>
          <div>
            <strong>Admin</strong>
            <small>Portfolio dashboard</small>
          </div>
        </div>

        <nav aria-label="Dashboard sections">
          <ul className="admin-tabs">
            {TABS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={tab === item.id ? "is-active" : ""}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => setTab(item.id)}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                  {item.id === "messages" && pending > 0 && <b className="admin-badge">{pending}</b>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-side__foot">
          <div className="admin-user">
            <img src={profileImage} alt="" width="36" height="36" />
            <div>
              <strong>{admin.name}</strong>
              <small>@{admin.username}</small>
            </div>
          </div>
          <Button variant="outline" onClick={() => onNavigate("home")}>
            View website
          </Button>
          <Button variant="ghost" onClick={signOut}>
            Log out
          </Button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === "overview" && <Overview onOpenTab={setTab} />}
        {tab === "projects" && <ProjectsManager notify={notify} />}
        {tab === "profile" && <ProfileSettings notify={notify} />}
        {tab === "resume" && <ResumeSettings notify={notify} />}
        {tab === "messages" && <MessagesManager notify={notify} onPendingChange={setPending} />}
      </main>

      <Notification notification={notification} onDismiss={dismiss} />
    </div>
  );
}
