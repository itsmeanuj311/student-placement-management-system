-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM (
    'APPLIED',
    'UNDER_REVIEW',
    'INTERVIEWING',
    'OFFERED',
    'REJECTED'
);

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'REJECTED',
    'LEFT',
    'BANNED'
);

-- CreateEnum
CREATE TYPE "PlatformActionType" AS ENUM (
    'CREATE',
    'UPDATE',
    'BAN',
    'UNBAN',
    'APPROVE',
    'REJECT',
    'JOIN',
    'LEAVE',
    'INVITE_SENT'
);

-- CreateEnum
CREATE TYPE "PlatformEntityType" AS ENUM (
    'USER',
    'ORG_ADMIN',
    'MEMBERSHIP',
    'APPLICATION',
    'PLATFORM'
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SUPER_ADMIN',

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "full_name" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "photo" TEXT,
    "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "job_role" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_at" TIMESTAMP(3),
    "created_by_super_admin_id" INTEGER,
    "banned_by_super_admin_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "organization_bio" TEXT,
    "organization_logo" TEXT,
    "invite_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_at" TIMESTAMP(3),
    "created_by_super_admin_id" INTEGER,
    "banned_by_super_admin_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "org_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "invite_code_used" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "banned_at" TIMESTAMP(3),
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "company_name" TEXT NOT NULL,
    "role_applied" TEXT NOT NULL,
    "application_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "max_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_actions" (
    "id" SERIAL NOT NULL,
    "action_type" "PlatformActionType" NOT NULL,
    "entity_type" "PlatformEntityType" NOT NULL,
    "actor_user_id" INTEGER,
    "actor_org_admin_id" INTEGER,
    "actor_super_admin_id" INTEGER,
    "target_user_id" INTEGER,
    "target_org_admin_id" INTEGER,
    "target_membership_id" INTEGER,
    "target_application_id" INTEGER,
    "summary" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_created_by_super_admin_id_idx" ON "users"("created_by_super_admin_id");

-- CreateIndex
CREATE INDEX "users_banned_by_super_admin_id_idx" ON "users"("banned_by_super_admin_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "org_admins_email_key" ON "org_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "org_admins_invite_code_key" ON "org_admins"("invite_code");

-- CreateIndex
CREATE INDEX "org_admins_created_by_super_admin_id_idx" ON "org_admins"("created_by_super_admin_id");

-- CreateIndex
CREATE INDEX "org_admins_banned_by_super_admin_id_idx" ON "org_admins"("banned_by_super_admin_id");

-- CreateIndex
CREATE INDEX "org_admins_created_at_idx" ON "org_admins"("created_at");

-- CreateIndex
CREATE INDEX "organization_memberships_user_id_idx" ON "organization_memberships"("user_id");

-- CreateIndex
CREATE INDEX "organization_memberships_organization_id_idx" ON "organization_memberships"("organization_id");

-- CreateIndex
CREATE INDEX "organization_memberships_status_idx" ON "organization_memberships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_user_id_organization_id_key"
ON "organization_memberships"("user_id", "organization_id");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE INDEX "applications_organization_id_idx" ON "applications"("organization_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_user_id_organization_id_company_name_application_date_key"
ON "applications"("user_id", "organization_id", "company_name", "application_date");

-- CreateIndex
CREATE INDEX "streaks_user_id_idx" ON "streaks"("user_id");

-- CreateIndex
CREATE INDEX "streaks_organization_id_idx" ON "streaks"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_organization_id_key" ON "streaks"("user_id", "organization_id");

-- CreateIndex
CREATE INDEX "platform_actions_action_type_idx" ON "platform_actions"("action_type");

-- CreateIndex
CREATE INDEX "platform_actions_entity_type_idx" ON "platform_actions"("entity_type");

-- CreateIndex
CREATE INDEX "platform_actions_actor_user_id_idx" ON "platform_actions"("actor_user_id");

-- CreateIndex
CREATE INDEX "platform_actions_actor_org_admin_id_idx" ON "platform_actions"("actor_org_admin_id");

-- CreateIndex
CREATE INDEX "platform_actions_actor_super_admin_id_idx" ON "platform_actions"("actor_super_admin_id");

-- CreateIndex
CREATE INDEX "platform_actions_target_user_id_idx" ON "platform_actions"("target_user_id");

-- CreateIndex
CREATE INDEX "platform_actions_target_org_admin_id_idx" ON "platform_actions"("target_org_admin_id");

-- CreateIndex
CREATE INDEX "platform_actions_target_membership_id_idx" ON "platform_actions"("target_membership_id");

-- CreateIndex
CREATE INDEX "platform_actions_target_application_id_idx" ON "platform_actions"("target_application_id");

-- CreateIndex
CREATE INDEX "platform_actions_created_at_idx" ON "platform_actions"("created_at");

-- AddForeignKey
ALTER TABLE "users"
ADD CONSTRAINT "users_created_by_super_admin_id_fkey"
FOREIGN KEY ("created_by_super_admin_id") REFERENCES "super_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"
ADD CONSTRAINT "users_banned_by_super_admin_id_fkey"
FOREIGN KEY ("banned_by_super_admin_id") REFERENCES "super_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_admins"
ADD CONSTRAINT "org_admins_created_by_super_admin_id_fkey"
FOREIGN KEY ("created_by_super_admin_id") REFERENCES "super_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_admins"
ADD CONSTRAINT "org_admins_banned_by_super_admin_id_fkey"
FOREIGN KEY ("banned_by_super_admin_id") REFERENCES "super_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships"
ADD CONSTRAINT "organization_memberships_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships"
ADD CONSTRAINT "organization_memberships_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "org_admins"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications"
ADD CONSTRAINT "applications_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications"
ADD CONSTRAINT "applications_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "org_admins"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks"
ADD CONSTRAINT "streaks_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks"
ADD CONSTRAINT "streaks_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "org_admins"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_actor_user_id_fkey"
FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_actor_org_admin_id_fkey"
FOREIGN KEY ("actor_org_admin_id") REFERENCES "org_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_actor_super_admin_id_fkey"
FOREIGN KEY ("actor_super_admin_id") REFERENCES "super_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_target_user_id_fkey"
FOREIGN KEY ("target_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_target_org_admin_id_fkey"
FOREIGN KEY ("target_org_admin_id") REFERENCES "org_admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_target_membership_id_fkey"
FOREIGN KEY ("target_membership_id") REFERENCES "organization_memberships"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_actions"
ADD CONSTRAINT "platform_actions_target_application_id_fkey"
FOREIGN KEY ("target_application_id") REFERENCES "applications"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
