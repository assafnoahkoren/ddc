-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateEnum
CREATE TYPE "catalog"."FieldDataType" AS ENUM ('string');

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."integrations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "strategy" VARCHAR(100) NOT NULL,
    "configuration" JSONB NOT NULL,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."collections" (
    "id" UUID NOT NULL,
    "integration_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."physical_fields" (
    "id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data_type" "catalog"."FieldDataType" NOT NULL DEFAULT 'string',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physical_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."logical_fields" (
    "id" UUID NOT NULL,
    "schema_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data_type" "catalog"."FieldDataType" NOT NULL DEFAULT 'string',
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logical_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."logical_schemas" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "version" VARCHAR(50) NOT NULL DEFAULT '1.0',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logical_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."logical_schema_to_collections" (
    "id" UUID NOT NULL,
    "logical_schema_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logical_schema_to_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."logical_to_physical_field_mappings" (
    "id" UUID NOT NULL,
    "schema_to_collection_id" UUID NOT NULL,
    "logical_field_id" UUID NOT NULL,
    "physical_field_id" UUID NOT NULL,
    "transformation" TEXT,
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logical_to_physical_field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "logical_schemas_name_key" ON "catalog"."logical_schemas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "logical_schema_to_collections_logical_schema_id_collection__key" ON "catalog"."logical_schema_to_collections"("logical_schema_id", "collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "logical_to_physical_field_mappings_schema_to_collection_id__key" ON "catalog"."logical_to_physical_field_mappings"("schema_to_collection_id", "logical_field_id", "physical_field_id");

-- AddForeignKey
ALTER TABLE "catalog"."collections" ADD CONSTRAINT "collections_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "catalog"."integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."physical_fields" ADD CONSTRAINT "physical_fields_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "catalog"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."logical_fields" ADD CONSTRAINT "logical_fields_schema_id_fkey" FOREIGN KEY ("schema_id") REFERENCES "catalog"."logical_schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."logical_schema_to_collections" ADD CONSTRAINT "logical_schema_to_collections_logical_schema_id_fkey" FOREIGN KEY ("logical_schema_id") REFERENCES "catalog"."logical_schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."logical_schema_to_collections" ADD CONSTRAINT "logical_schema_to_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "catalog"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."logical_to_physical_field_mappings" ADD CONSTRAINT "logical_to_physical_field_mappings_schema_to_collection_id_fkey" FOREIGN KEY ("schema_to_collection_id") REFERENCES "catalog"."logical_schema_to_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."logical_to_physical_field_mappings" ADD CONSTRAINT "logical_to_physical_field_mappings_logical_field_id_fkey" FOREIGN KEY ("logical_field_id") REFERENCES "catalog"."logical_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."logical_to_physical_field_mappings" ADD CONSTRAINT "logical_to_physical_field_mappings_physical_field_id_fkey" FOREIGN KEY ("physical_field_id") REFERENCES "catalog"."physical_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
