/*
  Warnings:

  - Added the required column `userId` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "empreendimentos" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
