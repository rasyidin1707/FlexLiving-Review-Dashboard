-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostawayId" INTEGER,
    "name" TEXT NOT NULL,
    "channel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "websiteVisible" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sourceReviewId" TEXT,
    "externalKey" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT,
    "ratingOverall" REAL,
    "ratingItems" TEXT,
    "publicText" TEXT,
    "submittedAt" DATETIME,
    "authorName" TEXT,
    "channel" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous" BOOLEAN,
    "next" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_hostawayId_key" ON "Listing"("hostawayId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_name_key" ON "Listing"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_externalKey_key" ON "Review"("externalKey");

-- CreateIndex
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");

-- CreateIndex
CREATE INDEX "Review_source_idx" ON "Review"("source");

-- CreateIndex
CREATE INDEX "Review_source_sourceReviewId_idx" ON "Review"("source", "sourceReviewId");

-- CreateIndex
CREATE INDEX "Review_channel_idx" ON "Review"("channel");

-- CreateIndex
CREATE INDEX "Review_type_idx" ON "Review"("type");

-- CreateIndex
CREATE INDEX "Review_approved_idx" ON "Review"("approved");

-- CreateIndex
CREATE INDEX "Review_submittedAt_idx" ON "Review"("submittedAt");

-- CreateIndex
CREATE INDEX "Review_ratingOverall_idx" ON "Review"("ratingOverall");

-- CreateIndex
CREATE INDEX "ActivityLog_reviewId_createdAt_idx" ON "ActivityLog"("reviewId", "createdAt");

