/*
  Warnings:

  - The values [ENGINEER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `engenheiroId` on the `empreendimentos` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MASTER', 'APPROVER', 'CONTROLLER', 'READER');
ALTER TABLE "users" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "roles" TYPE "Role_new"[] USING ("roles"::text::"Role_new"[]);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY['READER']::"Role"[];
COMMIT;

-- DropForeignKey
ALTER TABLE "empreendimentos" DROP CONSTRAINT "empreendimentos_engenheiroId_fkey";

-- AlterTable
ALTER TABLE "empreendimentos" DROP COLUMN "engenheiroId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
