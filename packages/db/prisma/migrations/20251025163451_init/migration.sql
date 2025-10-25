-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

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
CREATE TABLE "catalog"."logical_sources" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "logical_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."logical_fields" (
    "id" UUID NOT NULL,
    "logical_source_id" UUID NOT NULL,
    "field_name" VARCHAR(255) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logical_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."physical_sources" (
    "id" UUID NOT NULL,
    "integration_id" UUID NOT NULL,
    "source_type" VARCHAR(100) NOT NULL,
    "index_name" VARCHAR(255) NOT NULL,
    "sourcetype" VARCHAR(255) NOT NULL,
    "source" VARCHAR(255),
    "event_code" INTEGER,
    "metadata" JSONB,
    "discovered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."physical_fields" (
    "id" UUID NOT NULL,
    "physical_source_id" UUID NOT NULL,
    "field_name" VARCHAR(255) NOT NULL,
    "field_type" VARCHAR(50),
    "sample_values" JSONB,
    "discovered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."field_mappings" (
    "id" UUID NOT NULL,
    "logical_field_id" UUID NOT NULL,
    "physical_field_id" UUID NOT NULL,
    "transformation_rule" TEXT,
    "confidence_score" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."source_mappings" (
    "id" UUID NOT NULL,
    "logical_source_id" UUID NOT NULL,
    "physical_source_id" UUID NOT NULL,
    "confidence_score" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "logical_sources_name_key" ON "catalog"."logical_sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "logical_fields_logical_source_id_field_name_key" ON "catalog"."logical_fields"("logical_source_id", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "physical_sources_integration_id_index_name_sourcetype_event_key" ON "catalog"."physical_sources"("integration_id", "index_name", "sourcetype", "event_code");

-- CreateIndex
CREATE UNIQUE INDEX "physical_fields_physical_source_id_field_name_key" ON "catalog"."physical_fields"("physical_source_id", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "field_mappings_logical_field_id_physical_field_id_key" ON "catalog"."field_mappings"("logical_field_id", "physical_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "source_mappings_logical_source_id_physical_source_id_key" ON "catalog"."source_mappings"("logical_source_id", "physical_source_id");

-- AddForeignKey
ALTER TABLE "catalog"."logical_fields" ADD CONSTRAINT "logical_fields_logical_source_id_fkey" FOREIGN KEY ("logical_source_id") REFERENCES "catalog"."logical_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."physical_fields" ADD CONSTRAINT "physical_fields_physical_source_id_fkey" FOREIGN KEY ("physical_source_id") REFERENCES "catalog"."physical_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."field_mappings" ADD CONSTRAINT "field_mappings_logical_field_id_fkey" FOREIGN KEY ("logical_field_id") REFERENCES "catalog"."logical_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."field_mappings" ADD CONSTRAINT "field_mappings_physical_field_id_fkey" FOREIGN KEY ("physical_field_id") REFERENCES "catalog"."physical_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."source_mappings" ADD CONSTRAINT "source_mappings_logical_source_id_fkey" FOREIGN KEY ("logical_source_id") REFERENCES "catalog"."logical_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."source_mappings" ADD CONSTRAINT "source_mappings_physical_source_id_fkey" FOREIGN KEY ("physical_source_id") REFERENCES "catalog"."physical_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
