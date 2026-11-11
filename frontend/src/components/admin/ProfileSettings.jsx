import { useState } from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { profile } from "../../data/portfolioData";
import { restoreProfileImage, uploadProfileImage } from "../../services/adminService";
import { checkImage, LIMITS_MB } from "../../utils/fileChecks";
import { formatBytes } from "../../utils/formatDate";
import Button from "../common/Button";
import FilePreview from "./FilePreview";

export default function ProfileSettings({ notify }) {
  const { profileImage, hasCustomProfileImage, applySettings } = useSiteSettings();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null); // "save" | "restore" | null

  const pick = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    const problem = checkImage(picked, "The picture");
    setError(problem);
    setFile(problem ? null : picked);
  };

  const save = async () => {
    setBusy("save");
    setError("");
    try {
      applySettings(await uploadProfileImage(file)); // the whole website switches to the new picture
      setFile(null);
      notify("success", "Profile picture updated. It now appears on your portfolio.");
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
      applySettings(await restoreProfileImage());
      notify("success", "The original profile picture was restored.");
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
          <h1>Profile picture</h1>
          <p>Replace the photo shown in the hero section of your portfolio. No code changes needed.</p>
        </div>
      </header>

      <div className="admin-two">
        <section className="admin-card">
          <h2>Current picture</h2>
          <div className="avatar-preview">
            <img src={profileImage} alt="Current profile picture" />
          </div>
          <p className="admin-meta">{hasCustomProfileImage ? "Uploaded picture" : `Original picture (${profile.image})`}</p>
          {hasCustomProfileImage && (
            <Button variant="danger" onClick={restore} loading={busy === "restore"} disabled={busy !== null}>
              Restore original
            </Button>
          )}
        </section>

        <section className="admin-card">
          <h2>Upload a new picture</h2>
          <p className="admin-meta">JPG, PNG or WEBP, up to {LIMITS_MB.image} MB. Square photos work best.</p>
          <label className="btn btn--outline">
            Choose picture
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} hidden />
          </label>

          {file && (
            <div className="avatar-new">
              <div className="avatar-preview avatar-preview--small">
                <FilePreview file={file} />
              </div>
              <div>
                <strong>{file.name}</strong>
                <small>{formatBytes(file.size)}</small>
              </div>
            </div>
          )}
          {error && <p className="field__error" role="alert">{error}</p>}

          <div className="admin-actions">
            <Button variant="primary" onClick={save} loading={busy === "save"} disabled={!file || busy !== null}>
              Save as profile picture
            </Button>
            {file && <Button variant="ghost" onClick={() => setFile(null)} disabled={busy !== null}>Cancel</Button>}
          </div>
        </section>
      </div>
    </div>
  );
}
