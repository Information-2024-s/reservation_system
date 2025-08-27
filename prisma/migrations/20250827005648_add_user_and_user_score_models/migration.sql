/*
  Warnings:

  - You are about to drop the column `userId` on the `Score` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_userId_fkey";

-- DropIndex
DROP INDEX "Score_userId_idx";

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserScore" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserScore_userId_idx" ON "UserScore"("userId");

-- CreateIndex
CREATE INDEX "User_teamId_idx" ON "User"("teamId");

-- AddForeignKey
ALTER TABLE "UserScore" ADD CONSTRAINT "UserScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
