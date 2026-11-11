import { useState } from "react";
import { assetUrl } from "../../services/api";
import { formatFullDate } from "../../utils/formatDate";
import Button from "../common/Button";
import Modal from "../common/Modal";
import ProjectPreview from "./ProjectPreview";

// Project details: large preview (image or video), thumbnails, full description, tools and link.
export default function ProjectModal({ project, onClose }) {
  const [activeId, setActiveId] = useState(project.media[0]?.id ?? null);
  const active = project.media.find((item) => item.id === activeId) || null;
  const completed = formatFullDate(project.completionDate);
  const cover = assetUrl(project.coverUrl);

  return (
    <Modal title={project.title} description={project.category} onClose={onClose} size="xl">
      <div className="project-modal">
        <div className="project-modal__stage">
          {active?.mediaType === "VIDEO" ? (
            <video key={active.id} src={assetUrl(active.url)} poster={cover || undefined} controls playsInline preload="metadata" />
          ) : active ? (
            <img key={active.id} src={assetUrl(active.url)} alt={`${project.title} preview`} />
          ) : (
            <ProjectPreview title={project.title} category={project.category} variant={project.id} />
          )}
        </div>

        {project.media.length > 1 && (
          <ul className="project-modal__thumbs" aria-label="Project media">
            {project.media.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === activeId ? "is-active" : ""}
                  onClick={() => setActiveId(item.id)}
                  aria-label={`Show ${item.mediaType === "VIDEO" ? "video" : `image ${index + 1}`}`}
                  aria-pressed={item.id === activeId}
                >
                  {item.mediaType === "VIDEO" ? <span className="project-modal__play">▶</span> : <img src={assetUrl(item.url)} alt="" loading="lazy" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="project-modal__info">
          <p className="project-modal__description">{project.description}</p>
          <dl className="project-modal__facts">
            <div>
              <dt>Category</dt>
              <dd>{project.category}</dd>
            </div>
            {completed && (
              <div>
                <dt>Completed</dt>
                <dd>{completed}</dd>
              </div>
            )}
          </dl>
          {project.toolsUsed.length > 0 && (
            <div>
              <p className="project-modal__label">Tools used</p>
              <ul className="tags">
                {project.toolsUsed.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          )}
          {project.projectLink && (
            <Button variant="primary" icon="↗" href={project.projectLink} target="_blank" rel="noopener noreferrer">
              View project
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
