-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_lineUserId_fkey";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "userId" TEXT;
