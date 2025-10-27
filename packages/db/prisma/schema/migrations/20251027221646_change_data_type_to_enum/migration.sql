/*
  Warnings:

  - The `data_type` column on the `logical_fields` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `data_type` column on the `physical_fields` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "catalog"."FieldDataType" AS ENUM ('string');

-- AlterTable
ALTER TABLE "catalog"."logical_fields" DROP COLUMN "data_type",
ADD COLUMN     "data_type" "catalog"."FieldDataType" NOT NULL DEFAULT 'string';

-- AlterTable
ALTER TABLE "catalog"."physical_fields" DROP COLUMN "data_type",
ADD COLUMN     "data_type" "catalog"."FieldDataType" NOT NULL DEFAULT 'string';
