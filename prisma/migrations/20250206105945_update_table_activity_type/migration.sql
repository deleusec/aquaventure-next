-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER,
    "activityId" INTEGER,
    "activityTypeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "ActivityType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Media" ("activityId", "createdAt", "id", "type", "updatedAt", "url", "userId") SELECT "activityId", "createdAt", "id", "type", "updatedAt", "url", "userId" FROM "Media";
DROP TABLE "Media";
ALTER TABLE "new_Media" RENAME TO "Media";
CREATE UNIQUE INDEX "Media_userId_key" ON "Media"("userId");
CREATE UNIQUE INDEX "Media_activityId_key" ON "Media"("activityId");
CREATE UNIQUE INDEX "Media_activityTypeId_key" ON "Media"("activityTypeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
