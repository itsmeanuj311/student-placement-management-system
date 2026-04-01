import type { Request, Response } from "express";
import { prisma } from "@repo/db";

const userProfileInclude = {
  memberships: {
    include: {
      organization: {
        select: {
          id: true,
          email: true,
          organizationName: true,
          organizationLogo: true,
          isActive: true,
          isBanned: true,
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  },
  applications: {
    include: {
      organization: {
        select: {
          id: true,
          organizationName: true,
          organizationLogo: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  streaks: {
    include: {
      organization: {
        select: {
          id: true,
          organizationName: true,
          organizationLogo: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  },
} as const;

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id ?? req.query.userId ?? req.body?.userId);
    const organizationId = Number(
      req.query.organizationId ?? req.body?.organizationId,
    );

    if (!Number.isNaN(userId) && userId > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: userProfileInclude,
      });

      if (!user) {
        return res.status(404).json({ message: "User profile not found." });
      }

      return res.status(200).json({
        message: "Profile fetched successfully.",
        data: user,
      });
    }

    if (!Number.isNaN(organizationId) && organizationId > 0) {
      const organization = await prisma.orgAdmin.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          email: true,
          organizationName: true,
          organizationBio: true,
          organizationLogo: true,
          inviteCode: true,
          isActive: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!organization) {
        return res.status(404).json({ message: "Organization profile not found." });
      }

      return res.status(200).json({
        message: "Profile fetched successfully.",
        data: organization,
      });
    }

    return res.status(400).json({
      message: "Please send userId or organizationId.",
    });
  } catch {
    return res.status(500).json({ message: "Failed to get profile." });
  }
};
