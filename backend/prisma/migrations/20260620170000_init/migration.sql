-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PROTECTOR', 'ONG', 'PARTNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DogSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DogGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DogAgeRange" AS ENUM ('PUPPY', 'YOUNG', 'ADULT', 'SENIOR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DogStatus" AS ENUM ('AVAILABLE', 'UNDER_ANALYSIS', 'ADOPTED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AdoptionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DonationCampaignStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProviderName" AS ENUM ('MOCK', 'ABACATEPAY');

-- CreateEnum
CREATE TYPE "HelpType" AS ENUM ('FOOD', 'TREATMENT', 'MEDICINE', 'TRANSPORT', 'TEMPORARY_HOME', 'OTHER');

-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('DOG', 'ONG', 'PROTECTOR');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone" VARCHAR(40),
    "city" VARCHAR(120),
    "state" VARCHAR(2),
    "avatar_url" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dogs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "age" INTEGER,
    "age_range" "DogAgeRange" NOT NULL DEFAULT 'UNKNOWN',
    "size" "DogSize" NOT NULL DEFAULT 'UNKNOWN',
    "gender" "DogGender" NOT NULL DEFAULT 'UNKNOWN',
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "address" VARCHAR(180),
    "image_url" TEXT,
    "health_condition" TEXT,
    "vaccinated" BOOLEAN,
    "neutered" BOOLEAN,
    "special_needs" TEXT,
    "contact_name" VARCHAR(120),
    "contact_info" VARCHAR(180),
    "status" "DogStatus" NOT NULL DEFAULT 'AVAILABLE',
    "moderation_status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "urgency_level" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM',
    "created_by_id" UUID NOT NULL,
    "adopted_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dog_images" (
    "id" UUID NOT NULL,
    "dog_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_requests" (
    "id" UUID NOT NULL,
    "dog_id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "housing_type" VARCHAR(120) NOT NULL,
    "has_yard" BOOLEAN NOT NULL DEFAULT false,
    "has_other_pets" BOOLEAN NOT NULL DEFAULT false,
    "experience" TEXT NOT NULL,
    "routine" TEXT NOT NULL,
    "family_agreement" BOOLEAN NOT NULL DEFAULT false,
    "responsibility_agreement" BOOLEAN NOT NULL DEFAULT false,
    "adopter_name" VARCHAR(120) NOT NULL,
    "adopter_email" VARCHAR(180) NOT NULL,
    "adopter_phone" VARCHAR(40),
    "adopter_city" VARCHAR(120),
    "adopter_state" VARCHAR(2),
    "status" "AdoptionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "status_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoption_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_campaigns" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "help_type" "HelpType" NOT NULL DEFAULT 'OTHER',
    "beneficiary_type" "BeneficiaryType" NOT NULL DEFAULT 'DOG',
    "beneficiary_name" VARCHAR(160) NOT NULL,
    "city" VARCHAR(120),
    "state" VARCHAR(2),
    "image_url" TEXT,
    "goal_amount_in_cents" INTEGER NOT NULL,
    "current_amount_in_cents" INTEGER NOT NULL DEFAULT 0,
    "suggested_amount_in_cents" INTEGER,
    "status" "DonationCampaignStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "dog_id" UUID,
    "created_by_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "donor_user_id" UUID,
    "donor_name" VARCHAR(120) NOT NULL,
    "donor_email" VARCHAR(180) NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "external_payment_id" VARCHAR(160),
    "payment_provider" "PaymentProviderName" NOT NULL,
    "br_code" TEXT,
    "br_code_base64" TEXT,
    "expires_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" UUID NOT NULL,
    "provider" "PaymentProviderName" NOT NULL,
    "event_id" VARCHAR(160),
    "external_payment_id" VARCHAR(160),
    "type" VARCHAR(120) NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "description" TEXT NOT NULL,
    "contact_url" TEXT,
    "contact_email" VARCHAR(180),
    "contact_phone" VARCHAR(40),
    "social_url" TEXT,
    "status" "PartnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "action" VARCHAR(120) NOT NULL,
    "entity_type" VARCHAR(120) NOT NULL,
    "entity_id" VARCHAR(160) NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_city_idx" ON "user_profiles"("city");

-- CreateIndex
CREATE INDEX "user_profiles_state_idx" ON "user_profiles"("state");

-- CreateIndex
CREATE INDEX "dogs_status_idx" ON "dogs"("status");

-- CreateIndex
CREATE INDEX "dogs_moderation_status_idx" ON "dogs"("moderation_status");

-- CreateIndex
CREATE INDEX "dogs_city_idx" ON "dogs"("city");

-- CreateIndex
CREATE INDEX "dogs_state_idx" ON "dogs"("state");

-- CreateIndex
CREATE INDEX "dogs_size_idx" ON "dogs"("size");

-- CreateIndex
CREATE INDEX "dogs_gender_idx" ON "dogs"("gender");

-- CreateIndex
CREATE INDEX "dogs_age_range_idx" ON "dogs"("age_range");

-- CreateIndex
CREATE INDEX "dogs_created_by_id_idx" ON "dogs"("created_by_id");

-- CreateIndex
CREATE INDEX "dogs_deleted_at_idx" ON "dogs"("deleted_at");

-- CreateIndex
CREATE INDEX "dog_images_dog_id_idx" ON "dog_images"("dog_id");

-- CreateIndex
CREATE INDEX "adoption_requests_dog_id_idx" ON "adoption_requests"("dog_id");

-- CreateIndex
CREATE INDEX "adoption_requests_requester_id_idx" ON "adoption_requests"("requester_id");

-- CreateIndex
CREATE INDEX "adoption_requests_status_idx" ON "adoption_requests"("status");

-- CreateIndex
CREATE INDEX "donation_campaigns_status_idx" ON "donation_campaigns"("status");

-- CreateIndex
CREATE INDEX "donation_campaigns_dog_id_idx" ON "donation_campaigns"("dog_id");

-- CreateIndex
CREATE INDEX "donation_campaigns_created_by_id_idx" ON "donation_campaigns"("created_by_id");

-- CreateIndex
CREATE INDEX "donation_campaigns_city_idx" ON "donation_campaigns"("city");

-- CreateIndex
CREATE INDEX "donation_campaigns_state_idx" ON "donation_campaigns"("state");

-- CreateIndex
CREATE INDEX "donation_campaigns_deleted_at_idx" ON "donation_campaigns"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "donations_external_payment_id_key" ON "donations"("external_payment_id");

-- CreateIndex
CREATE INDEX "donations_campaign_id_idx" ON "donations"("campaign_id");

-- CreateIndex
CREATE INDEX "donations_donor_user_id_idx" ON "donations"("donor_user_id");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_external_payment_id_idx" ON "donations"("external_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_event_id_key" ON "payment_events"("event_id");

-- CreateIndex
CREATE INDEX "payment_events_event_id_idx" ON "payment_events"("event_id");

-- CreateIndex
CREATE INDEX "payment_events_external_payment_id_idx" ON "payment_events"("external_payment_id");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "partners"("status");

-- CreateIndex
CREATE INDEX "partners_city_idx" ON "partners"("city");

-- CreateIndex
CREATE INDEX "partners_state_idx" ON "partners"("state");

-- CreateIndex
CREATE INDEX "partners_created_by_id_idx" ON "partners"("created_by_id");

-- CreateIndex
CREATE INDEX "partners_deleted_at_idx" ON "partners"("deleted_at");

-- CreateIndex
CREATE INDEX "admin_actions_admin_id_idx" ON "admin_actions"("admin_id");

-- CreateIndex
CREATE INDEX "admin_actions_entity_type_entity_id_idx" ON "admin_actions"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dog_images" ADD CONSTRAINT "dog_images_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_campaigns" ADD CONSTRAINT "donation_campaigns_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_campaigns" ADD CONSTRAINT "donation_campaigns_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "donation_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_user_id_fkey" FOREIGN KEY ("donor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
