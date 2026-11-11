import { useCallback, useEffect, useState } from "react";
import { deleteMessage, listMessages, saveMessageReply, setMessageStatus } from "../../services/adminService";
import { formatDate, formatShortDate } from "../../utils/formatDate";
import Button from "../common/Button";
import Loader from "../common/Loader";
import Modal from "../common/Modal";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "READ", label: "Read" },
  { id: "REPLIED", label: "Replied" },
  { id: "ARCHIVED", label: "Archived" },
];

export default function MessagesManager({ notify, onPendingChange }) {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({ ALL: 0, PENDING: 0, READ: 0, REPLIED: 0, ARCHIVED: 0 });
  const [filter, setFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  // Wait until the admin pauses typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    try {
      const data = await listMessages({ search, status: filter });
      setMessages(data.messages);
      setCounts(data.counts);
      onPendingChange?.(data.counts.PENDING);
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, [search, filter, onPendingChange]);

  useEffect(() => {
    setStatus((current) => (current === "ready" ? current : "loading"));
    load();
  }, [load]);

  const current = messages.find((message) => message.id === openId) || null;

  const replaceMessage = (updated) => {
    setMessages((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    load(); // refresh counts and filters
  };

  const open = async (message) => {
    setOpenId(message.id);
    if (message.status === "PENDING") {
      try {
        replaceMessage(await setMessageStatus(message.id, "READ")); // opening a new message marks it as read
      } catch {
        // Not critical: the admin can still mark it manually.
      }
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Messages</h1>
          <p>Messages sent from your Contact form. Only you can see them.</p>
        </div>
      </header>

      <div className="admin-toolbar">
        <div className="field admin-search">
          <label htmlFor="message-search" className="sr-only">Search messages</label>
          <input
            id="message-search"
            type="search"
            placeholder="Search name, email, subject or message..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="admin-filters" role="group" aria-label="Filter by status">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" className={filter === item.id ? "is-active" : ""} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label} <b>{counts[item.id]}</b>
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && <Loader label="Loading messages..." />}
      {status === "error" && (
        <div className="admin-card" role="alert">
          <p className="form-status form-status--error">{error}</p>
          <Button variant="outline" onClick={load}>Try again</Button>
        </div>
      )}
      {status === "ready" && messages.length === 0 && (
        <p className="admin-empty">{search || filter !== "ALL" ? "No messages match your search or filter." : "No messages yet."}</p>
      )}

      {status === "ready" && messages.length > 0 && (
        <ul className="admin-list">
          {messages.map((message) => (
            <li key={message.id}>
              <button type="button" className={`message-row ${message.status === "PENDING" ? "is-new" : ""}`} onClick={() => open(message)}>
                <div className="message-row__main">
                  <strong>{message.subject}</strong>
                  <small>
                    {message.senderName} · {message.email}
                  </small>
                  <span className="message-row__preview">{message.content}</span>
                </div>
                <div className="message-row__meta">
                  <span className={`status-pill status-pill--${message.status.toLowerCase()}`}>{message.status}</span>
                  <small>{formatShortDate(message.createdAt)}</small>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {current && (
        <MessageDetail
          key={current.id}
          message={current}
          notify={notify}
          onClose={() => setOpenId(null)}
          onChanged={replaceMessage}
          onDeleted={() => {
            setOpenId(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function MessageDetail({ message, notify, onClose, onChanged, onDeleted }) {
  const [reply, setReply] = useState(message.adminReply || "");
  const [busy, setBusy] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const run = async (name, action, successText) => {
    setBusy(name);
    setError("");
    try {
      const result = await action();
      if (name === "delete") onDeleted();
      else onChanged(result);
      notify("success", successText);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveReply = () => {
    if (!reply.trim()) return setError("Write a reply first.");
    return run("reply", () => saveMessageReply(message.id, reply), "Reply saved in the dashboard.");
  };

  return (
    <Modal title={message.subject} description={`From ${message.senderName}`} size="lg" onClose={onClose}>
      <div className="message-detail">
        <dl className="admin-facts">
          <div><dt>Name</dt><dd>{message.senderName}</dd></div>
          {message.username && <div><dt>Username</dt><dd>{message.username}</dd></div>}
          <div><dt>Email</dt><dd><a href={`mailto:${message.email}`}>{message.email}</a></dd></div>
          <div><dt>Received</dt><dd>{formatDate(message.createdAt)}</dd></div>
          <div>
            <dt>Status</dt>
            <dd>
              <select
                aria-label="Message status"
                value={message.status}
                disabled={busy !== null}
                onChange={(event) => run("status", () => setMessageStatus(message.id, event.target.value), `Marked as ${event.target.value.toLowerCase()}.`)}
              >
                {FILTERS.slice(1).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </dd>
          </div>
        </dl>

        <p className="message-detail__body">{message.content}</p>

        <div className="field">
          <label htmlFor="message-reply">Your reply {message.repliedAt && <span className="field__optional">(saved {formatDate(message.repliedAt)})</span>}</label>
          <textarea id="message-reply" rows="4" value={reply} onChange={(event) => setReply(event.target.value)} />
          <p className="field__hint">Replies are saved inside this dashboard only. No email is sent to the visitor, so contact them at {message.email} yourself if needed.</p>
        </div>

        {error && <p className="form-status form-status--error" role="alert">{error}</p>}

        <div className="modal__footer message-detail__actions">
          {confirmDelete ? (
            <>
              <span className="message-detail__confirm">Delete this message permanently?</span>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy !== null}>Keep</Button>
              <Button variant="danger" onClick={() => run("delete", () => deleteMessage(message.id), "Message deleted.")} loading={busy === "delete"}>Yes, delete</Button>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={busy !== null}>Delete</Button>
              {message.status !== "ARCHIVED" && (
                <Button variant="outline" onClick={() => run("archive", () => setMessageStatus(message.id, "ARCHIVED"), "Message archived.")} loading={busy === "archive"} disabled={busy !== null}>Archive</Button>
              )}
              {message.status === "PENDING" && (
                <Button variant="outline" onClick={() => run("read", () => setMessageStatus(message.id, "READ"), "Marked as read.")} disabled={busy !== null}>Mark as read</Button>
              )}
              <Button variant="primary" onClick={saveReply} loading={busy === "reply"} disabled={busy !== null}>Save reply</Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
