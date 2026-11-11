-- Readable dates: every date column becomes text in Philippine time, e.g. "2026-11-10 22:30:15".
-- Existing values (Prisma stored them as milliseconds, e.g. 1794320803558) are converted to that text.
-- New rows get the current Philippine time from the column DEFAULT.
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')),
    "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'))
);
INSERT INTO "new_Admin" ("createdAt", "email", "id", "name", "passwordHash", "updatedAt", "username") SELECT
    CASE WHEN "createdAt" IS NULL THEN NULL WHEN typeof("createdAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "createdAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "createdAt", '+8 hours'), "createdAt") END,
    "email",
    "id",
    "name",
    "passwordHash",
    CASE WHEN "updatedAt" IS NULL THEN NULL WHEN typeof("updatedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "updatedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "updatedAt", '+8 hours'), "updatedAt") END,
    "username"
FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderName" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminReply" TEXT,
    "repliedAt" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')),
    "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'))
);
INSERT INTO "new_Message" ("adminReply", "content", "createdAt", "email", "id", "repliedAt", "senderName", "status", "subject", "updatedAt", "username") SELECT
    "adminReply",
    "content",
    CASE WHEN "createdAt" IS NULL THEN NULL WHEN typeof("createdAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "createdAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "createdAt", '+8 hours'), "createdAt") END,
    "email",
    "id",
    CASE WHEN "repliedAt" IS NULL THEN NULL WHEN typeof("repliedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "repliedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "repliedAt", '+8 hours'), "repliedAt") END,
    "senderName",
    "status",
    "subject",
    CASE WHEN "updatedAt" IS NULL THEN NULL WHEN typeof("updatedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "updatedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "updatedAt", '+8 hours'), "updatedAt") END,
    "username"
FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_status_createdAt_idx" ON "Message"("status", "createdAt");
CREATE TABLE "new_PortfolioSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "profileImagePath" TEXT,
    "profileImageOriginalName" TEXT,
    "profileImageMimeType" TEXT,
    "profileImageSizeBytes" INTEGER,
    "resumeFilePath" TEXT,
    "resumeOriginalName" TEXT,
    "resumeMimeType" TEXT,
    "resumeSizeBytes" INTEGER,
    "resumeUploadedAt" TEXT,
    "sampleProjectsSeededAt" TEXT,
    "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'))
);
INSERT INTO "new_PortfolioSettings" ("id", "profileImageMimeType", "profileImageOriginalName", "profileImagePath", "profileImageSizeBytes", "resumeFilePath", "resumeMimeType", "resumeOriginalName", "resumeSizeBytes", "resumeUploadedAt", "sampleProjectsSeededAt", "updatedAt") SELECT
    "id",
    "profileImageMimeType",
    "profileImageOriginalName",
    "profileImagePath",
    "profileImageSizeBytes",
    "resumeFilePath",
    "resumeMimeType",
    "resumeOriginalName",
    "resumeSizeBytes",
    CASE WHEN "resumeUploadedAt" IS NULL THEN NULL WHEN typeof("resumeUploadedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "resumeUploadedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "resumeUploadedAt", '+8 hours'), "resumeUploadedAt") END,
    CASE WHEN "sampleProjectsSeededAt" IS NULL THEN NULL WHEN typeof("sampleProjectsSeededAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "sampleProjectsSeededAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "sampleProjectsSeededAt", '+8 hours'), "sampleProjectsSeededAt") END,
    CASE WHEN "updatedAt" IS NULL THEN NULL WHEN typeof("updatedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "updatedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "updatedAt", '+8 hours'), "updatedAt") END
FROM "PortfolioSettings";
DROP TABLE "PortfolioSettings";
ALTER TABLE "new_PortfolioSettings" RENAME TO "PortfolioSettings";
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "toolsUsed" TEXT NOT NULL DEFAULT '',
    "projectLink" TEXT,
    "completionDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')),
    "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'))
);
INSERT INTO "new_Project" ("category", "completionDate", "createdAt", "description", "id", "projectLink", "sortOrder", "status", "title", "toolsUsed", "updatedAt") SELECT
    "category",
    "completionDate",
    CASE WHEN "createdAt" IS NULL THEN NULL WHEN typeof("createdAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "createdAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "createdAt", '+8 hours'), "createdAt") END,
    "description",
    "id",
    "projectLink",
    "sortOrder",
    "status",
    "title",
    "toolsUsed",
    CASE WHEN "updatedAt" IS NULL THEN NULL WHEN typeof("updatedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "updatedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "updatedAt", '+8 hours'), "updatedAt") END
FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_status_sortOrder_idx" ON "Project"("status", "sortOrder");
CREATE TABLE "new_ProjectMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours')),
    CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectMedia" ("filePath", "id", "isCover", "mediaType", "mimeType", "originalName", "projectId", "sizeBytes", "storedName", "uploadedAt") SELECT
    "filePath",
    "id",
    "isCover",
    "mediaType",
    "mimeType",
    "originalName",
    "projectId",
    "sizeBytes",
    "storedName",
    CASE WHEN "uploadedAt" IS NULL THEN NULL WHEN typeof("uploadedAt") IN ('integer', 'real') THEN strftime('%Y-%m-%d %H:%M:%S', "uploadedAt" / 1000, 'unixepoch', '+8 hours') ELSE COALESCE(strftime('%Y-%m-%d %H:%M:%S', "uploadedAt", '+8 hours'), "uploadedAt") END
FROM "ProjectMedia";
DROP TABLE "ProjectMedia";
ALTER TABLE "new_ProjectMedia" RENAME TO "ProjectMedia";
CREATE UNIQUE INDEX "ProjectMedia_storedName_key" ON "ProjectMedia"("storedName");
CREATE INDEX "ProjectMedia_projectId_idx" ON "ProjectMedia"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
