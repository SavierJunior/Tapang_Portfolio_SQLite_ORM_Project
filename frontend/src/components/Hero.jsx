import { useSiteSettings } from "../context/SiteSettingsContext";
import { hero, profile } from "../data/portfolioData";
import Button from "./common/Button";
import "../styles/Hero.css";

export default function Hero({ onNavigate }) {
  const { profileImage, hasCustomProfileImage, ready } = useSiteSettings();

  return (
    <section id="home" className="hero">
      <div className="hero__glow hero__glow--one" aria-hidden="true" />
      <div className="hero__glow hero__glow--two" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__text">
          <p className="hero__label">
            <span className="hero__dot" aria-hidden="true" />
            {hero.label}
          </p>

          <h1>
            {hero.titleLine1}
            <br />
            <span className="gradient-text">{hero.titleLine2}</span>
          </h1>

          <p className="hero__description">
            Hi, I'm <strong>{profile.fullName}</strong> — an Information Technology student with a creative focus on{" "}
            <strong>{hero.focusAreaText}</strong>
          </p>

          <div className="hero__actions">
            <Button variant="primary" icon="↗" onClick={() => onNavigate("projects")}>
              Explore My Work
            </Button>
            <Button variant="outline" icon="↓" onClick={() => onNavigate("about")}>
              More About Me
            </Button>
          </div>

          <ul className="hero__highlights">
            {hero.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="hero__profile">
          <div className="orbit orbit--outer" aria-hidden="true" />
          <div className="orbit orbit--inner" aria-hidden="true" />

          <div className={`portrait ${ready ? "" : "portrait--loading"} ${hasCustomProfileImage ? "portrait--custom" : ""}`.trim()}>
            {ready && (
              <img
                src={profileImage}
                alt={`Portrait of ${profile.shortName}`}
                width="520"
                height="520"
                onError={(event) => {
                  // If an uploaded picture cannot load, fall back to the original photo.
                  if (!event.currentTarget.src.endsWith(profile.image)) event.currentTarget.src = profile.image;
                }}
              />
            )}
            <span className="portrait__tint" aria-hidden="true" />
          </div>

          {hero.floatingCards.map((card, index) => (
            <div key={card.value} className={`float-card float-card--${index === 0 ? "top" : "bottom"}`}>
              <span aria-hidden="true">{card.symbol}</span>
              <div>
                <small>{card.label}</small>
                <strong>{card.value}</strong>
              </div>
            </div>
          ))}

          <div className="portrait-name">
            <strong>{profile.initials}</strong>
            <span>{hero.badge}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
