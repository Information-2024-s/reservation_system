/*
  Warnings:

  - You are about to drop the column `gameSessionName` on the `TeamScore` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('First', 'Second', 'Third');

-- DropIndex
DROP INDEX "TeamScore_gameSessionName_idx";

-- AlterTable
ALTER TABLE "TeamScore" DROP COLUMN "gameSessionName";

-- CreateTable
CREATE TABLE "TmpScore" (
    "id" INTEGER NOT NULL,
    "stage" "Stage" NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TmpScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TmpScore_stage_idx" ON "TmpScore"("stage");
