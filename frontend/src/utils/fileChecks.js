// Friendly early checks in the browser. The server repeats them on the real file content,
// so these only save the admin a wasted upload.
export const LIMITS_MB = { image: 5, video: 50, resume: 10 };
export const MAX_PROJECT_IMAGES = 10;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function checkImage(file, label = "Image") {
  if (!IMAGE_TYPES.includes(file.type)) return `${label} must be a JPG, PNG or WEBP image.`;
  if (file.size > LIMITS_MB.image * 1024 * 1024) return `${label} is larger than ${LIMITS_MB.image} MB.`;
  return "";
}

export function checkVideo(file) {
  if (file.type !== "video/mp4") return "The video preview must be an MP4 file.";
  if (file.size > LIMITS_MB.video * 1024 * 1024) return `The video is larger than ${LIMITS_MB.video} MB.`;
  return "";
}

export function checkPdf(file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "The resume must be a PDF file.";
  if (file.size > LIMITS_MB.resume * 1024 * 1024) return `The resume is larger than ${LIMITS_MB.resume} MB.`;
  if (file.size === 0) return "That file is empty.";
  return "";
}
