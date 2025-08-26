/*
  Warnings:

  - You are about to drop the column `userId` on the `empreendimentos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "empreendimentos" DROP CONSTRAINT "empreendimentos_userId_fkey";

-- AlterTable
ALTER TABLE "empreendimentos" DROP COLUMN "userId";
