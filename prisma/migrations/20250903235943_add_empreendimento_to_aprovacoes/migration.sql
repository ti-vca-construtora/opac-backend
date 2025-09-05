/*
  Warnings:

  - Added the required column `empreendimentoId` to the `aprovacoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "aprovacoes" ADD COLUMN     "empreendimentoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "aprovacoes" ADD CONSTRAINT "aprovacoes_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "empreendimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
