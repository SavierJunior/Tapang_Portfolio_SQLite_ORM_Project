import { useEffect, useMemo, useState } from "react";
import { sectionLinks } from "../data/navigationData";
import { profile } from "../data/portfolioData";
import { useActiveSection } from "../hooks/useActiveSection";
import "../styles/Navigation.css";

export default function Navigation({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sectionIds = useMemo(() => sectionLinks.map((link) => link.id), []);
  const activeSection = useActiveSection(sectionIds, page === "home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleNavigate = (id) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  const isCurrent = (id) => page === "home" && activeSection === id;

  return (
    <header className={`navbar ${scrolled || menuOpen ? "navbar--solid" : ""}`}>
      <div className="nav-container">
        <button type="button" className="brand" onClick={() => handleNavigate("home")} aria-label="Go to home">
          <span className="brand-logo">{profile.initials}</span>
          <span className="brand-text">
            <strong>{profile.brandName}</strong>
            <small>{profile.brandTagline}</small>
          </span>
        </button>

        <button
          type="button"
          className="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className={`burger ${menuOpen ? "burger--open" : ""}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <nav id="main-navigation" className={`nav-panel ${menuOpen ? "nav-panel--open" : ""}`} aria-label="Main">
          <ul className="nav-links">
            {sectionLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={isCurrent(link.id) ? "is-active" : ""}
                  aria-current={isCurrent(link.id) ? "page" : undefined}
                  onClick={() => handleNavigate(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
