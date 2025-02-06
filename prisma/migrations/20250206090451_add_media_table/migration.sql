/*
  Warnings:

  - You are about to drop the column `reservationDate` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Media` table. All the data in the column will be lost.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER,
    "activityId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Media" ("activityId", "createdAt", "id", "updatedAt", "userId") SELECT "activityId", "createdAt", "id", "updatedAt", "userId" FROM "Media";
DROP TABLE "Media";
ALTER TABLE "new_Media" RENAME TO "Media";
CREATE UNIQUE INDEX "Media_userId_key" ON "Media"("userId");
CREATE UNIQUE INDEX "Media_activityId_key" ON "Media"("activityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
