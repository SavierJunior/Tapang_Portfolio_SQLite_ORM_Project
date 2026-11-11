import { useSiteSettings } from "../context/SiteSettingsContext";
import { resume } from "../data/portfolioData";
import { formatBytes, formatShortDate } from "../utils/formatDate";
import Button from "./common/Button";
import Reveal from "./common/Reveal";
import "../styles/Resume.css";

// "View" and "Download" always use the CURRENT resume (the one replaced in the Admin Dashboard,
// or the original resume.pdf until a new one is uploaded).
export default function Resume() {
  const { resume: current } = useSiteSettings();

  return (
    <section id="resume" className="section resume">
      <div className="container">
        <Reveal className="resume-box">
          <div className="resume-box__doc" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <b>PDF</b>
          </div>

          <div className="resume-box__text">
            <p className="section-label">
              <span>05</span>Resume
            </p>
            <h2>{resume.title}</h2>
            <p>{resume.text}</p>
            {current.custom && (
              <p className="resume-box__meta">
                Updated {formatShortDate(current.uploadedAt)} · PDF · {formatBytes(current.sizeBytes)}
              </p>
            )}
          </div>

          <div className="resume-box__actions">
            <Button variant="primary" icon="↗" href={current.viewUrl} target="_blank" rel="noopener noreferrer">
              View Resume
            </Button>
            <Button variant="outline" icon="↓" href={current.downloadUrl} download={resume.downloadName}>
              Download PDF
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
