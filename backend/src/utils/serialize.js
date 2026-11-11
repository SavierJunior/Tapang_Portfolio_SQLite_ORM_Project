// Converts database rows into the JSON the frontend receives.
const { toIso } = require("./time");
const toolList = (text) =>
  String(text || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);


function serializeMedia(media) {
  return {
    id: media.id,
    mediaType: media.mediaType,
    isCover: media.isCover,
    originalName: media.originalName,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    url: `/uploads/${media.filePath}`,
  };
}

function serializeProject(project) {
  const media = [...(project.media || [])]
    .sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.id - b.id)
    .map(serializeMedia);
  const cover = media.find((item) => item.isCover && item.mediaType === "IMAGE") || media.find((item) => item.mediaType === "IMAGE");

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    toolsUsed: toolList(project.toolsUsed),
    toolsUsedText: project.toolsUsed,
    projectLink: project.projectLink,
    completionDate: project.completionDate || null, // already "YYYY-MM-DD"
    status: project.status,
    sortOrder: project.sortOrder,
    createdAt: toIso(project.createdAt),
    updatedAt: toIso(project.updatedAt),
    coverUrl: cover ? cover.url : null,
    media,
  };
}

function serializeMessage(message) {
  return {
    id: message.id,
    senderName: message.senderName,
    username: message.username,
    email: message.email,
    subject: message.subject,
    content: message.content,
    status: message.status,
    adminReply: message.adminReply,
    repliedAt: toIso(message.repliedAt),
    createdAt: toIso(message.createdAt),
    updatedAt: toIso(message.updatedAt),
  };
}

// Public view of the profile picture + resume. `null` urls tell the frontend to use the
// original files that ship with the website (public/profile.jpg and public/resume.pdf).
function serializeSettings(settings) {
  const version = settings?.updatedAt ? new Date(toIso(settings.updatedAt)).getTime() || 0 : 0;
  return {
    profileImageUrl: settings?.profileImagePath ? `/uploads/${settings.profileImagePath}?v=${version}` : null,
    profileImage: settings?.profileImagePath
      ? {
          originalName: settings.profileImageOriginalName,
          mimeType: settings.profileImageMimeType,
          sizeBytes: settings.profileImageSizeBytes,
        }
      : null,
    resume: settings?.resumeFilePath
      ? {
          viewUrl: `/api/settings/resume/file?v=${version}`,
          downloadUrl: `/api/settings/resume/file?download=1&v=${version}`,
          originalName: settings.resumeOriginalName,
          sizeBytes: settings.resumeSizeBytes,
          uploadedAt: toIso(settings.resumeUploadedAt),
        }
      : null,
    updatedAt: toIso(settings?.updatedAt),
  };
}

module.exports = { serializeProject, serializeMessage, serializeSettings, toolList };
