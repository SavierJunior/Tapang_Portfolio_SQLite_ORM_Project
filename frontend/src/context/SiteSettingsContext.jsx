import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { profile, resume as originalResume } from "../data/portfolioData";
import { assetUrl } from "../services/api";
import { getSettings } from "../services/portfolioService";

// ONE shared source of truth for the current profile picture and resume.
// Public pages and the Admin Dashboard read the same values, so an upload shows up everywhere at once.
const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setSettings(await getSettings());
    } catch {
      setSettings(null); // backend offline: fall back to the original bundled files
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const customImage = settings?.profileImageUrl ? assetUrl(settings.profileImageUrl) : null;
    const customResume = settings?.resume || null;
    return {
      ready,
      refresh,
      applySettings: (next) => {
        setSettings(next);
        setReady(true);
      },
      profileImage: customImage || profile.image, // original /profile.jpg is the fallback
      hasCustomProfileImage: Boolean(customImage),
      resume: customResume
        ? {
            custom: true,
            viewUrl: assetUrl(customResume.viewUrl),
            downloadUrl: assetUrl(customResume.downloadUrl),
            originalName: customResume.originalName,
            sizeBytes: customResume.sizeBytes,
            uploadedAt: customResume.uploadedAt,
          }
        : { custom: false, viewUrl: originalResume.file, downloadUrl: originalResume.file }, // original /resume.pdf
    };
  }, [settings, ready, refresh]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error("useSiteSettings must be used inside SiteSettingsProvider");
  return context;
}
