import { profile } from "../data/portfolioData";
import "../styles/Footer.css";

// `onNavigate` replaces the old undefined goTo() - App passes the real navigation handler.
export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="brand-logo">{profile.initials}</span>
          <div>
            <strong>{profile.footerName}</strong>
            <small>{profile.footerTagline}</small>
          </div>
        </div>

        <p className="footer__copy">© {new Date().getFullYear()} Andrei Tapang</p>

        <div className="footer__links">
          <button type="button" className="footer__admin" onClick={() => onNavigate("admin")}>
            Admin
          </button>
          <button type="button" className="footer__top" onClick={() => onNavigate("home")}>
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
