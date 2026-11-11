import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteProject, listProjects, setProjectStatus } from "../../services/adminService";
import { assetUrl } from "../../services/api";
import { formatShortDate } from "../../utils/formatDate";
import Button from "../common/Button";
import Loader from "../common/Loader";
import Modal from "../common/Modal";
import ProjectForm from "./ProjectForm";

export default function ProjectsManager({ notify }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null); // null | { project?: Project }
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setProjects(await listProjects());
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => [...new Set(projects.map((project) => project.category))], [projects]);

  const handleSaved = (saved, wasEditing) => {
    setProjects((list) =>
      (wasEditing ? list.map((item) => (item.id === saved.id ? saved : item)) : [...list, saved]).sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
      )
    );
    setEditor(null);
    notify("success", wasEditing ? "Project updated." : "Project added.");
  };

  const toggleStatus = async (project) => {
    const next = project.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusyId(project.id);
    try {
      const saved = await setProjectStatus(project.id, next);
      setProjects((list) => list.map((item) => (item.id === saved.id ? saved : item)));
      notify("success", next === "PUBLISHED" ? `"${saved.title}" is now published.` : `"${saved.title}" is now hidden (draft).`);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const project = toDelete;
    setBusyId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((list) => list.filter((item) => item.id !== project.id));
      setToDelete(null);
      notify("success", `"${project.title}" was deleted.`);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Projects</h1>
          <p>Everything here controls the Projects section of your portfolio. Only published projects are public.</p>
        </div>
        <Button variant="primary" icon="+" onClick={() => setEditor({})}>
          Add project
        </Button>
      </header>

      {status === "loading" && <Loader label="Loading projects..." />}
      {status === "error" && (
        <div className="admin-card" role="alert">
          <p className="form-status form-status--error">{error}</p>
          <Button variant="outline" onClick={load}>Try again</Button>
        </div>
      )}
      {status === "ready" && projects.length === 0 && <p className="admin-empty">No projects yet. Add your first one.</p>}

      {status === "ready" && projects.length > 0 && (
        <ul className="admin-list">
          {projects.map((project) => {
            const busy = busyId === project.id;
            return (
              <li key={project.id} className="admin-row">
                <div className="admin-row__thumb">
                  {project.coverUrl ? <img src={assetUrl(project.coverUrl)} alt="" loading="lazy" /> : <span>{project.title.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="admin-row__main">
                  <div className="admin-row__title">
                    <strong>{project.title}</strong>
                    <span className={`status-pill status-pill--${project.status.toLowerCase()}`}>{project.status === "PUBLISHED" ? "Published" : "Draft"}</span>
                  </div>
                  <small>
                    {project.category} · order {project.sortOrder} · {project.media.length} file{project.media.length === 1 ? "" : "s"} · updated {formatShortDate(project.updatedAt)}
                  </small>
                </div>
                <div className="admin-row__actions">
                  <Button variant="outline" onClick={() => setEditor({ project })} disabled={busy}>Edit</Button>
                  <Button variant="outline" onClick={() => toggleStatus(project)} loading={busy}>
                    {project.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="danger" onClick={() => setToDelete(project)} disabled={busy}>Delete</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editor && (
        <Modal
          title={editor.project ? "Edit project" : "Add project"}
          description={editor.project ? editor.project.title : "Fill in the details and upload your media."}
          size="xl"
          onClose={() => setEditor(null)}
        >
          <ProjectForm project={editor.project} categories={categories} onSaved={handleSaved} onCancel={() => setEditor(null)} />
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete this project?" description={`"${toDelete.title}" and its uploaded files will be permanently removed.`} size="sm" onClose={() => setToDelete(null)}>
          <div className="modal__footer">
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={busyId === toDelete.id}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={busyId === toDelete.id}>Delete project</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
