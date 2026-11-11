import { useEffect } from "react";

// Toast message. Shown only for real outcomes (success after the API confirms, or an error).
export default function Notification({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(onDismiss, notification.type === "error" ? 8000 : 4500);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div
      className={`toast toast--${notification.type}`}
      role={notification.type === "error" ? "alert" : "status"}
    >
      <span className="toast__icon" aria-hidden="true">
        {notification.type === "error" ? "!" : "✓"}
      </span>
      <p>{notification.message}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
