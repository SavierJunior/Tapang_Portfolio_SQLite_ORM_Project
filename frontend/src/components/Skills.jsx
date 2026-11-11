import { skills } from "../data/portfolioData";
import Reveal from "./common/Reveal";
import SectionHeading from "./common/SectionHeading";
import "../styles/Skills.css";

const icons = {
  animation: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="22" r="3" />
      <circle cx="16" cy="12" r="3" opacity=".7" />
      <circle cx="23" cy="20" r="3" opacity=".45" />
      <path d="M11.5 20 14 15M18.5 13.5l3 3.5" strokeDasharray="2 3" />
    </svg>
  ),
  motion: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22c4 0 4-12 8-12s4 12 8 12 4-12 8-12" />
      <path d="M4 26h24" opacity=".4" />
    </svg>
  ),
  cube: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4 27 10v12L16 28 5 22V10z" />
      <path d="M5 10l11 6 11-6M16 16v12" />
    </svg>
  ),
  design: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 26l4-1 14-14-3-3L7 22z" />
      <path d="M19 9l4 4M6 26l1-4" />
    </svg>
  ),
};

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <SectionHeading
          index="02"
          label="Skills"
          line1={skills.titleLine1}
          line2={skills.titleLine2}
          intro={skills.intro}
        />

        <ul className="skills__grid">
          {skills.items.map((skill, index) => (
            <li key={skill.title}>
              <Reveal delay={index * 70} className="skill-card">
                <span className="skill-card__icon">{icons[skill.icon]}</span>
                <h3>{skill.title}</h3>
                <p>{skill.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
