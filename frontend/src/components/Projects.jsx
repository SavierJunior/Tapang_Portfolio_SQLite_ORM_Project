import { useMemo, useState } from "react";
import { projects as copy } from "../data/portfolioData";
import { useProjects } from "../hooks/useProjects";
import Button from "./common/Button";
import Loader from "./common/Loader";
import SectionHeading from "./common/SectionHeading";
import ProjectCard from "./projects/ProjectCard";
import ProjectModal from "./projects/ProjectModal";
import "../styles/Projects.css";

// The gallery is database-driven: it shows every PUBLISHED project from SQLite (via the API).
export default function Projects() {
  const { projects, status, error, retry } = useProjects();
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => ["All", ...new Set(projects.map((project) => project.category))], [projects]);
  const activeCategory = categories.includes(category) ? category : "All";
  const visible = activeCategory === "All" ? projects : projects.filter((project) => project.category === activeCategory);

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <SectionHeading index="03" label="Projects" line1={copy.titleLine1} line2={copy.titleLine2} intro={copy.intro} />

        {status === "ready" && categories.length > 2 && (
          <div className="projects__filters" role="group" aria-label="Filter projects by category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={item === activeCategory ? "is-active" : ""}
                aria-pressed={item === activeCategory}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {status === "loading" && (
          <div className="projects__state">
            <Loader label="Loading projects..." />
          </div>
        )}

        {status === "error" && (
          <div className="projects__state projects__state--error" role="alert">
            <p>{error}</p>
            <Button variant="outline" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="projects__state">
            <p>No projects are published yet. Please check back soon.</p>
          </div>
        )}

        {status === "ready" && visible.length > 0 && (
          <ul className="projects__grid">
            {visible.map((project, index) => (
              <li key={project.id}>
                <ProjectCard project={project} index={index} onOpen={setSelected} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
