/*
  1. Removes the Student Information System table (Student).
  2. Stores Project.completionDate as readable text ("2026-11-09") instead of a timestamp number.

  Warnings:

  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Student_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Student";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- completionDate: convert the old DateTime value (milliseconds, e.g. 1794182400000) into a plain
-- "YYYY-MM-DD" text date (e.g. "2026-11-09"). Dates were saved as midnight UTC, so the UTC day is the chosen day.
INSERT INTO "new_Project" ("category", "completionDate", "createdAt", "description", "id", "projectLink", "sortOrder", "status", "title", "toolsUsed", "updatedAt") SELECT "category",
    CASE
        WHEN "completionDate" IS NULL THEN NULL
        WHEN typeof("completionDate") IN ('integer', 'real') THEN strftime('%Y-%m-%d', "completionDate" / 1000, 'unixepoch')
        ELSE substr("completionDate", 1, 10)
    END,
    "createdAt", "description", "id", "projectLink", "sortOrder", "status", "title", "toolsUsed", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_status_sortOrder_idx" ON "Project"("status", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
