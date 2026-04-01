import type { Request, Response } from "express";
import { prisma } from "@repo/db";

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

export const getApplication = async (req: Request, res: Response) => {
  try {
    const applicationId = Number(
      req.params.id ?? req.query.applicationId ?? req.body?.applicationId,
    );
    const userId = Number(req.query.userId ?? req.body?.userId);
    const organizationId = Number(
      req.query.organizationId ?? req.body?.organizationId,
    );

    if (!Number.isNaN(applicationId) && applicationId > 0) {
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          ...(Number.isNaN(userId) ? {} : { userId }),
          ...(Number.isNaN(organizationId) ? {} : { organizationId }),
        },
        include: applicationInclude,
      });

      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }

      return res.status(200).json({
        message: "Application fetched successfully.",
        data: application,
      });
    }

    const where: { userId?: number; organizationId?: number } = {};

    if (!Number.isNaN(userId) && userId > 0) {
      where.userId = userId;
    }

    if (!Number.isNaN(organizationId) && organizationId > 0) {
      where.organizationId = organizationId;
    }

    if (Object.keys(where).length === 0) {
      return res.status(400).json({
        message: "Please send userId, organizationId, or applicationId.",
      });
    }

    const applications = await prisma.application.findMany({
      where,
      include: applicationInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      message: "Applications fetched successfully.",
      data: {
        count: applications.length,
        applications,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to get applications." });
  }
};
