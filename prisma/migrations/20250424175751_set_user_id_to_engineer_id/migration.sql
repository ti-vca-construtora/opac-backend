/*
  Warnings:

  - You are about to drop the column `userId` on the `empreendimentos` table. All the data in the column will be lost.
  - Added the required column `engenheiroId` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "empreendimentos" DROP CONSTRAINT "empreendimentos_userId_fkey";

-- AlterTable
ALTER TABLE "empreendimentos" DROP COLUMN "userId",
ADD COLUMN     "engenheiroId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_engenheiroId_fkey" FOREIGN KEY ("engenheiroId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
