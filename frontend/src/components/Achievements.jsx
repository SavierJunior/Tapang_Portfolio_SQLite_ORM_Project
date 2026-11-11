import { achievements } from "../data/portfolioData";
import Reveal from "./common/Reveal";
import SectionHeading from "./common/SectionHeading";
import "../styles/Achievements.css";

export default function Achievements() {
  return (
    <section id="achievements" className="section achievements">
      <div className="container">
        <SectionHeading
          index="06"
          label="Achievements"
          line1={achievements.titleLine1}
          line2={achievements.titleLine2}
        />

        <ul className="achievements__list">
          {achievements.items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 70} className="achievement">
                <span className="achievement__number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
