import { education, profile } from "../data/portfolioData";
import Reveal from "./common/Reveal";
import SectionHeading from "./common/SectionHeading";
import "../styles/Education.css";

export default function Education() {
  return (
    <section id="education" className="section education">
      <div className="container">
        <SectionHeading index="04" label="Education" line1={education.titleLine1} line2={education.titleLine2} />

        <Reveal className="timeline">
          <span className="timeline__node" aria-hidden="true" />
          <article className="education-card">
            <span className="education-card__status">{education.status}</span>
            <div className="education-card__content">
              <p className="education-card__level">{education.level}</p>
              <h3>{education.degree}</h3>
              <p className="education-card__school">{education.school}</p>
              <p className="education-card__progress">{education.progress}</p>
            </div>
            <span className="education-card__mark" aria-hidden="true">
              {profile.initials}
            </span>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
