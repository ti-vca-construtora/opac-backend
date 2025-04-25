/*
  Warnings:

  - The `chequeData` column on the `empreendimentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "empreendimentos" DROP COLUMN "chequeData",
ADD COLUMN     "chequeData" TIMESTAMP(3);
