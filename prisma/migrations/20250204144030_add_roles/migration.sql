-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'APPROVER', 'CONTROLLER', 'ENGINEER', 'READER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY['READER']::"Role"[];
