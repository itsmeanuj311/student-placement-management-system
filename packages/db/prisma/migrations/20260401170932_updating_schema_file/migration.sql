/*
  Warnings:

  - You are about to drop the column `created_by_super_admin_id` on the `org_admins` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_super_admin_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `platform_actions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resume` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "org_admins" DROP CONSTRAINT "org_admins_created_by_super_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_actor_org_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_actor_super_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_actor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_target_application_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_target_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_target_org_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_actions" DROP CONSTRAINT "platform_actions_target_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_created_by_super_admin_id_fkey";

-- DropIndex
DROP INDEX "org_admins_created_at_idx";

-- DropIndex
DROP INDEX "org_admins_created_by_super_admin_id_idx";

-- DropIndex
DROP INDEX "users_created_at_idx";

-- DropIndex
DROP INDEX "users_created_by_super_admin_id_idx";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "resume" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "org_admins" DROP COLUMN "created_by_super_admin_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_by_super_admin_id";

-- DropTable
DROP TABLE "platform_actions";

-- DropEnum
DROP TYPE "PlatformActionType";

-- DropEnum
DROP TYPE "PlatformEntityType";
