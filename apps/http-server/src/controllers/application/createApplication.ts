import type { Request, Response } from "express";
import { MembershipStatus, prisma } from "@repo/db";

const applicationInclude = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      username: true,
    },
  },
  organization: {
    select: {
      id: true,
      email: true,
      organizationName: true,
      isActive: true,
      isBanned: true,
    },
  },
} as const;

export const createApplication = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    const organizationId = Number(req.body.organizationId);
    const companyName = String(req.body.companyName ?? "").trim();
    const roleApplied = String(req.body.roleApplied ?? "").trim();
    const resume = String(req.body.resume ?? "").trim();
    const notes =
      req.body.notes === undefined ? undefined : String(req.body.notes).trim();
    const applicationDate = req.body.applicationDate
      ? new Date(req.body.applicationDate)
      : new Date();

    if (
      Number.isNaN(userId) ||
      Number.isNaN(organizationId) ||
      !companyName ||
      !roleApplied ||
      !resume ||
      Number.isNaN(applicationDate.getTime())
    ) {
      return res.status(400).json({ message: "Please send valid application data." });
    }

    const [user, organization, membership] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.orgAdmin.findUnique({ where: { id: organizationId } }),
      prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      }),
    ]);

    if (!user || user.isBanned) {
      return res.status(404).json({ message: "User not found or banned." });
    }

    if (!organization || !organization.isActive || organization.isBanned) {
      return res
        .status(404)
        .json({ message: "Organization not found or not active." });
    }

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      return res.status(403).json({
        message: "User must be an active member of this organization.",
      });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        organizationId,
        companyName,
        roleApplied,
        applicationDate,
        resume,
        notes: notes ?? null,
      },
      include: applicationInclude,
    });

    return res.status(201).json({
      message: "Application created successfully.",
      data: application,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;

    if (code === "P2002") {
      return res.status(409).json({
        message: "This application already exists for the same date.",
      });
    }

    return res.status(500).json({ message: "Failed to create application." });
  }
};


