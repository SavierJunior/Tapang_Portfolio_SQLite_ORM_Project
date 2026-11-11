// Detects the REAL type of an uploaded file from its first bytes ("magic numbers").
// The filename and the browser-supplied MIME type are never trusted.

function startsWith(buffer, bytes, offset = 0) {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

const ascii = (text) => [...text].map((char) => char.charCodeAt(0));

function detectFileType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return { kind: "IMAGE", mime: "image/jpeg", ext: ".jpg" };
  }
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { kind: "IMAGE", mime: "image/png", ext: ".png" };
  }
  if (startsWith(buffer, ascii("RIFF")) && startsWith(buffer, ascii("WEBP"), 8)) {
    return { kind: "IMAGE", mime: "image/webp", ext: ".webp" };
  }
  // MP4: bytes 4-7 are "ftyp"; the brand that follows tells MP4 apart from MOV/HEIC/etc.
  if (startsWith(buffer, ascii("ftyp"), 4)) {
    const brand = buffer.subarray(8, 12).toString("latin1");
    const mp4Brands = ["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "dash", "M4V ", "MSNV"];
    if (mp4Brands.includes(brand)) return { kind: "VIDEO", mime: "video/mp4", ext: ".mp4" };
    return null;
  }
  // PDF: "%PDF-" header within the first 1024 bytes and an "%%EOF" marker near the end.
  const head = buffer.subarray(0, Math.min(buffer.length, 1024)).toString("latin1");
  if (head.includes("%PDF-")) {
    const tail = buffer.subarray(Math.max(0, buffer.length - 2048)).toString("latin1");
    if (tail.includes("%%EOF")) return { kind: "PDF", mime: "application/pdf", ext: ".pdf" };
    return null;
  }
  return null;
}

module.exports = { detectFileType };
