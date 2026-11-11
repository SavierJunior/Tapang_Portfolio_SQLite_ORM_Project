import { assetUrl } from "../../services/api";
import Button from "../common/Button";
import Reveal from "../common/Reveal";
import ProjectPreview from "./ProjectPreview";

export default function ProjectCard({ project, index, onOpen }) {
  const cover = assetUrl(project.coverUrl);
  const hasVideo = project.media.some((item) => item.mediaType === "VIDEO");
  const extraImages = project.media.filter((item) => item.mediaType === "IMAGE").length - (cover ? 1 : 0);

  return (
    <Reveal delay={Math.min(index, 6) * 70} className="project-card">
      <button type="button" className="project-card__media" onClick={() => onOpen(project)} aria-label={`Open details for ${project.title}`}>
        {cover ? (
          <img src={cover} alt="" loading="lazy" decoding="async" />
        ) : (
          <ProjectPreview title={project.title} category={project.category} variant={index} />
        )}
        <span className="project-card__category">{project.category}</span>
        {(hasVideo || extraImages > 0) && (
          <span className="project-card__badges">
            {hasVideo && <span>▶ Video</span>}
            {extraImages > 0 && <span>+{extraImages} image{extraImages > 1 ? "s" : ""}</span>}
          </span>
        )}
        <span className="project-card__hint" aria-hidden="true">
          View details
        </span>
      </button>

      <div className="project-card__body">
        <h3>{project.title}</h3>
        <p className="project-card__text">{project.description}</p>
        {project.toolsUsed.length > 0 && (
          <ul className="tags" aria-label="Tools used">
            {project.toolsUsed.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        )}
        <div className="project-card__actions">
          <Button variant="outline" icon="→" onClick={() => onOpen(project)}>
            Details
          </Button>
          {project.projectLink && (
            <Button variant="ghost" icon="↗" href={project.projectLink} target="_blank" rel="noopener noreferrer">
              View project
            </Button>
          )}
        </div>
      </div>
    </Reveal>
  );
}
