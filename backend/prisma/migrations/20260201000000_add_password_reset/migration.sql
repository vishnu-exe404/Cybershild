-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);
