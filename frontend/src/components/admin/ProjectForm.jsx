import { useState } from "react";
import { createProject, updateProject } from "../../services/adminService";
import { assetUrl } from "../../services/api";
import { checkImage, checkVideo, LIMITS_MB, MAX_PROJECT_IMAGES } from "../../utils/fileChecks";
import { formatBytes } from "../../utils/formatDate";
import Button from "../common/Button";
import FilePreview from "./FilePreview";

// Add / edit form. Files + text are sent together as multipart form data.
export default function ProjectForm({ project, categories, onSaved, onCancel }) {
  const editing = Boolean(project);
  const [values, setValues] = useState({
    title: project?.title || "",
    description: project?.description || "",
    category: project?.category || "",
    toolsUsed: project?.toolsUsedText || "",
    projectLink: project?.projectLink || "",
    completionDate: project?.completionDate || "",
    status: project?.status || "DRAFT",
    sortOrder: project ? String(project.sortOrder) : "",
  });
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const existing = project?.media || [];
  const [removed, setRemoved] = useState([]); // ids of existing media to delete
  const [coverId, setCoverId] = useState(existing.find((item) => item.isCover)?.id ?? null);
  const [coverFile, setCoverFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  const keptImages = existing.filter((item) => item.mediaType === "IMAGE" && !removed.includes(item.id)).length;
  const totalImages = keptImages + imageFiles.length + (coverFile ? 1 : 0);
  const existingVideo = existing.find((item) => item.mediaType === "VIDEO" && !removed.includes(item.id));

  const setField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const pickCover = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = checkImage(file, "The cover image");
    setFileError(problem);
    if (!problem) setCoverFile(file);
  };

  const pickImages = (event) => {
    const picked = [...(event.target.files || [])];
    event.target.value = "";
    if (!picked.length) return;
    for (const file of picked) {
      const problem = checkImage(file, `"${file.name}"`);
      if (problem) return setFileError(problem);
    }
    if (totalImages + picked.length > MAX_PROJECT_IMAGES) {
      return setFileError(`A project can have at most ${MAX_PROJECT_IMAGES} images (cover included).`);
    }
    setFileError("");
    setImageFiles((current) => [...current, ...picked]);
  };

  const pickVideo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = checkVideo(file);
    setFileError(problem);
    if (!problem) setVideoFile(file);
  };

  const toggleRemoved = (id) => setRemoved((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  const validate = () => {
    const found = {};
    if (!values.title.trim()) found.title = "Enter a project title.";
    else if (values.title.trim().length > 150) found.title = "Use 150 characters or fewer.";
    if (!values.description.trim()) found.description = "Enter a description.";
    if (!values.category.trim()) found.category = "Enter a category.";
    if (values.toolsUsed.length > 500) found.toolsUsed = "Use 500 characters or fewer.";
    if (values.projectLink.trim() && !/^https?:\/\/\S+$/i.test(values.projectLink.trim())) found.projectLink = "The link must start with http:// or https://.";
    if (values.sortOrder.trim() && !/^\d{1,6}$/.test(values.sortOrder.trim())) found.sortOrder = "Use a whole number, such as 1.";
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const formData = new FormData();
    for (const key of ["title", "description", "category", "toolsUsed", "projectLink", "completionDate", "status", "sortOrder"]) {
      formData.append(key, typeof values[key] === "string" ? values[key].trim() : values[key]);
    }
    if (coverFile) formData.append("cover", coverFile);
    imageFiles.forEach((file) => formData.append("images", file));
    if (videoFile) formData.append("video", videoFile);
    if (editing) {
      formData.append("removeMediaIds", JSON.stringify(removed));
      if (!coverFile && coverId && !removed.includes(coverId)) formData.append("coverMediaId", String(coverId));
    }

    setSaving(true);
    setFormError("");
    try {
      const saved = editing ? await updateProject(project.id, formData) : await createProject(formData);
      onSaved(saved, editing);
    } catch (error) {
      setFormError(error.message || "The project could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const textField = (name, label, props = {}) => (
    <div className={`field ${props.wide ? "field--wide" : ""}`}>
      <label htmlFor={`project-${name}`}>{label}</label>
      {props.multiline ? (
        <textarea id={`project-${name}`} name={name} rows="5" value={values[name]} onChange={setField} aria-invalid={Boolean(errors[name])} />
      ) : (
        <input
          id={`project-${name}`}
          name={name}
          type={props.type || "text"}
          list={props.list}
          placeholder={props.placeholder}
          value={values[name]}
          onChange={setField}
          aria-invalid={Boolean(errors[name])}
        />
      )}
      {props.hint && !errors[name] && <p className="field__hint">{props.hint}</p>}
      {errors[name] && <p className="field__error">{errors[name]}</p>}
    </div>
  );

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <div className="project-form__grid">
        {textField("title", "Project title *", { wide: true })}
        {textField("description", "Description *", { wide: true, multiline: true })}
        {textField("category", "Category *", { list: "project-categories", placeholder: "e.g. Creative Project" })}
        <datalist id="project-categories">
          {categories.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        {textField("toolsUsed", "Tools used", { placeholder: "Blender, After Effects", hint: "Separate tools with commas." })}
        {textField("projectLink", "Project link (optional)", { type: "url", placeholder: "https://..." })}
        {textField("completionDate", "Completion date (optional)", { type: "date" })}

        <div className="field">
          <label htmlFor="project-status">Publication status</label>
          <select id="project-status" name="status" value={values.status} onChange={setField}>
            <option value="DRAFT">Draft (hidden from visitors)</option>
            <option value="PUBLISHED">Published (visible on the portfolio)</option>
          </select>
        </div>
        {textField("sortOrder", "Display order (optional)", { placeholder: "1", hint: "Lower numbers appear first. Blank = keep or place last." })}
      </div>

      <fieldset className="project-media">
        <legend>Media</legend>
        <p className="field__hint">
          JPG, PNG or WEBP images up to {LIMITS_MB.image} MB each, one MP4 up to {LIMITS_MB.video} MB. Images: {totalImages} / {MAX_PROJECT_IMAGES}.
        </p>

        {existing.length > 0 && (
          <ul className="media-grid" aria-label="Current media">
            {existing.map((item) => {
              const isRemoved = removed.includes(item.id);
              const isCover = !coverFile && item.id === coverId && !isRemoved;
              return (
                <li key={item.id} className={isRemoved ? "is-removed" : ""}>
                  {item.mediaType === "VIDEO" ? (
                    <video src={assetUrl(item.url)} muted playsInline preload="metadata" />
                  ) : (
                    <img src={assetUrl(item.url)} alt="" />
                  )}
                  {isCover && <span className="media-grid__tag">Cover</span>}
                  {item.mediaType === "VIDEO" && <span className="media-grid__tag media-grid__tag--video">Video</span>}
                  <div className="media-grid__actions">
                    {item.mediaType === "IMAGE" && !isRemoved && !isCover && (
                      <button type="button" onClick={() => { setCoverId(item.id); setCoverFile(null); }}>
                        Make cover
                      </button>
                    )}
                    <button type="button" onClick={() => toggleRemoved(item.id)}>
                      {isRemoved ? "Undo" : "Remove"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="media-pickers">
          <div className="media-picker">
            <span>{editing ? "Replace cover image" : "Cover image"}</span>
            <label className="btn btn--outline">
              Choose image
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickCover} hidden />
            </label>
            {coverFile && (
              <div className="media-chip">
                <FilePreview file={coverFile} />
                <div>
                  <strong>{coverFile.name}</strong>
                  <small>{formatBytes(coverFile.size)}</small>
                </div>
                <button type="button" onClick={() => setCoverFile(null)} aria-label="Remove selected cover image">×</button>
              </div>
            )}
          </div>

          <div className="media-picker">
            <span>Additional images</span>
            <label className="btn btn--outline">
              Add images
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickImages} hidden />
            </label>
            {imageFiles.map((file, index) => (
              <div className="media-chip" key={`${file.name}-${file.size}-${index}`}>
                <FilePreview file={file} />
                <div>
                  <strong>{file.name}</strong>
                  <small>{formatBytes(file.size)}</small>
                </div>
                <button type="button" onClick={() => setImageFiles((list) => list.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}>×</button>
              </div>
            ))}
          </div>

          <div className="media-picker">
            <span>Video preview (MP4, optional)</span>
            <label className="btn btn--outline">
              {existingVideo || videoFile ? "Replace video" : "Choose video"}
              <input type="file" accept="video/mp4" onChange={pickVideo} hidden />
            </label>
            {videoFile && (
              <div className="media-chip">
                <FilePreview file={videoFile} />
                <div>
                  <strong>{videoFile.name}</strong>
                  <small>{formatBytes(videoFile.size)}</small>
                </div>
                <button type="button" onClick={() => setVideoFile(null)} aria-label="Remove selected video">×</button>
              </div>
            )}
          </div>
        </div>
        {fileError && <p className="field__error" role="alert">{fileError}</p>}
      </fieldset>

      {formError && <p className="form-status form-status--error" role="alert">{formError}</p>}

      <div className="modal__footer">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="primary" loading={saving}>
          {saving ? "Saving..." : editing ? "Save changes" : "Add project"}
        </Button>
      </div>
    </form>
  );
}
