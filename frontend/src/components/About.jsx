import { about } from "../data/portfolioData";
import Button from "./common/Button";
import Reveal from "./common/Reveal";
import SectionHeading from "./common/SectionHeading";
import "../styles/About.css";

export default function About({ onNavigate }) {
  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHeading index="01" label="About" line1={about.titleLine1} line2={about.titleLine2} />

        <Reveal className="about__grid">
          <div className="about__main">
            <p className="about__lead">
              {about.leadBefore}
              <strong>{about.lead}</strong>
              {about.leadAfter}
            </p>
            <p>{about.body}</p>
            <Button variant="outline" icon="↗" onClick={() => onNavigate("contact")}>
              Get In Touch
            </Button>
          </div>

          <dl className="about__details">
            {about.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
