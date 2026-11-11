import { useEffect, useState } from "react";

// Shows a local preview of a file the admin just picked (not uploaded yet).
export default function FilePreview({ file, className = "" }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;
  return file.type.startsWith("video/") ? (
    <video className={className} src={url} muted playsInline preload="metadata" />
  ) : (
    <img className={className} src={url} alt="" />
  );
}
