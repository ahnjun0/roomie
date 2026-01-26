-- CreateEnum
CREATE TYPE "HelpCategory" AS ENUM ('BUG', 'REPAIR');

-- CreateEnum
CREATE TYPE "HelpStatus" AS ENUM ('OPEN', 'SOLVED');

-- CreateTable
CREATE TABLE "HelpPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" "HelpCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "status" "HelpStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpPost_authorId_idx" ON "HelpPost"("authorId");

-- CreateIndex
CREATE INDEX "HelpPost_category_status_idx" ON "HelpPost"("category", "status");

-- CreateIndex
CREATE INDEX "HelpPost_createdAt_idx" ON "HelpPost"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "HelpPost" ADD CONSTRAINT "HelpPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
