import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import Loader from "./components/common/Loader";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import Home from "./pages/Home";
import { scrollToSection } from "./utils/scrollToSection";

// The admin dashboard is loaded only when it is opened, so public visitors never download it.
const AdminPage = lazy(() => import("./pages/AdminPage"));

const ADMIN_HASH = "#admin";

function pageFromHash() {
  if (window.location.hash === ADMIN_HASH) return "admin";
  return "home";
}

// App only decides which page is showing and routes navigation requests.
export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const pendingSection = useRef(null);

  // Keep the page in sync with the browser's Back/Forward buttons.
  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleNavigate = useCallback(
    (id) => {
      if (id === "admin") {
        setPage(id);
        window.history.replaceState(null, "", ADMIN_HASH);
        window.scrollTo(0, 0);
        return;
      }
      if (page !== "home") {
        pendingSection.current = id; // scroll once the Home page has rendered
        window.history.replaceState(null, "", window.location.pathname);
        setPage("home");
        return;
      }
      scrollToSection(id);
    },
    [page]
  );

  useEffect(() => {
    if (page === "home" && pendingSection.current) {
      const id = pendingSection.current;
      pendingSection.current = null;
      requestAnimationFrame(() => scrollToSection(id));
    }
  }, [page]);

  if (page === "admin") {
    return (
      <SiteSettingsProvider>
        <Suspense fallback={<Loader label="Opening dashboard..." />}>
          <AdminPage onNavigate={handleNavigate} />
        </Suspense>
      </SiteSettingsProvider>
    );
  }

  return (
    <SiteSettingsProvider>
      <div className="app">
        <Navigation page={page} onNavigate={handleNavigate} />
        <main><Home onNavigate={handleNavigate} /></main>
        <Footer onNavigate={handleNavigate} />
      </div>
    </SiteSettingsProvider>
  );
}
