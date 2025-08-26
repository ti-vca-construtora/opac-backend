/*
  Warnings:

  - You are about to drop the `anos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semanas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dias" DROP CONSTRAINT "dias_semanaId_fkey";

-- DropForeignKey
ALTER TABLE "meses" DROP CONSTRAINT "meses_anoId_fkey";

-- DropForeignKey
ALTER TABLE "semanas" DROP CONSTRAINT "semanas_mesId_fkey";

-- DropTable
DROP TABLE "anos";

-- DropTable
DROP TABLE "dias";

-- DropTable
DROP TABLE "meses";

-- DropTable
DROP TABLE "semanas";
