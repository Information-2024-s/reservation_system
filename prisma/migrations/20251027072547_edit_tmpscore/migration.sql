/*
  Warnings:

  - The primary key for the `TmpScore` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "TmpScore" DROP CONSTRAINT "TmpScore_pkey",
ADD CONSTRAINT "TmpScore_pkey" PRIMARY KEY ("id", "stage");
