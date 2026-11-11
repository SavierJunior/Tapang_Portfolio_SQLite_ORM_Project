/*
  Warnings:

  - You are about to drop the column `slug` on the `Project` table. All the data in the column will be lost.

*/
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
    "completionDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("category", "completionDate", "createdAt", "description", "id", "projectLink", "sortOrder", "status", "title", "toolsUsed", "updatedAt") SELECT "category", "completionDate", "createdAt", "description", "id", "projectLink", "sortOrder", "status", "title", "toolsUsed", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_status_sortOrder_idx" ON "Project"("status", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
