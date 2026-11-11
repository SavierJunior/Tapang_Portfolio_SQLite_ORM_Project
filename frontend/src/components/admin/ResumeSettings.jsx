import { useState } from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { resume as originalResume } from "../../data/portfolioData";
import { restoreResume, uploadResume } from "../../services/adminService";
import { checkPdf, LIMITS_MB } from "../../utils/fileChecks";
import { formatBytes, formatShortDate } from "../../utils/formatDate";
import Button from "../common/Button";

export default function ResumeSettings({ notify }) {
  const { resume, applySettings } = useSiteSettings();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const pick = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    const problem = checkPdf(picked);
    setError(problem);
    setFile(problem ? null : picked);
  };

  const replace = async () => {
    setBusy("replace");
    setError("");
    try {
      applySettings(await uploadResume(file));
      setFile(null);
      notify("success", "Resume replaced. Visitors now see the new file.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy("restore");
    setError("");
    try {
      applySettings(await restoreResume());
      notify("success", "The original resume was restored.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Resume</h1>
          <p>Replace the PDF used by the View Resume and Download buttons on your portfolio.</p>
        </div>
      </header>

      <div className="admin-two">
        <section className="admin-card">
          <h2>Current resume</h2>
          <dl className="admin-facts">
            <div>
              <dt>File</dt>
              <dd>{resume.custom ? resume.originalName : "resume.pdf (original)"}</dd>
            </div>
            <div>
              <dt>Uploaded</dt>
              <dd>{resume.custom ? formatShortDate(resume.uploadedAt) : "Bundled with the website"}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{resume.custom ? formatBytes(resume.sizeBytes) : "-"}</dd>
            </div>
          </dl>
          <div className="admin-actions">
            <Button variant="outline" icon="↗" href={resume.viewUrl} target="_blank" rel="noopener noreferrer">View</Button>
            <Button variant="outline" icon="↓" href={resume.downloadUrl} download={originalResume.downloadName}>Download</Button>
            {resume.custom && (
              <Button variant="danger" onClick={restore} loading={busy === "restore"} disabled={busy !== null}>
                Restore original
              </Button>
            )}
          </div>
        </section>

        <section className="admin-card">
          <h2>Replace resume</h2>
          <p className="admin-meta">PDF only, up to {LIMITS_MB.resume} MB. The current resume stays online until the new one is saved.</p>
          <label className="btn btn--outline">
            Choose PDF
            <input type="file" accept="application/pdf,.pdf" onChange={pick} hidden />
          </label>

          {file && (
            <div className="resume-confirm">
              <strong>{file.name}</strong>
              <small>{formatBytes(file.size)}</small>
              <p>Confirm to replace the current resume with this file.</p>
            </div>
          )}
          {error && <p className="field__error" role="alert">{error}</p>}

          <div className="admin-actions">
            <Button variant="primary" onClick={replace} loading={busy === "replace"} disabled={!file || busy !== null}>
              Confirm and replace
            </Button>
            {file && <Button variant="ghost" onClick={() => setFile(null)} disabled={busy !== null}>Cancel</Button>}
          </div>
        </section>
      </div>
    </div>
  );
}
