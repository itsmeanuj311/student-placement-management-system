import type { Request, Response } from "express";
import { MembershipStatus, prisma } from "@repo/db";

export const leaveOrganization = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId ?? req.query.userId);
    const organizationId = Number(
      req.body.organizationId ?? req.query.organizationId,
    );

    if (
      Number.isNaN(userId) ||
      userId <= 0 ||
      Number.isNaN(organizationId) ||
      organizationId <= 0
    ) {
      return res.status(400).json({
        message: "User ID and organization ID are required.",
      });
    }

    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." });
    }

    if (membership.status === MembershipStatus.LEFT) {
      return res.status(400).json({ message: "User already left this organization." });
    }

    const updatedMembership = await prisma.organizationMembership.update({
      where: { id: membership.id },
      data: { status: MembershipStatus.LEFT },
      include: {
        organization: {
          select: {
            id: true,
            organizationName: true,
            organizationLogo: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Organization left successfully.",
      data: updatedMembership,
    });
  } catch {
    return res.status(500).json({ message: "Failed to leave organization." });
  }
};
