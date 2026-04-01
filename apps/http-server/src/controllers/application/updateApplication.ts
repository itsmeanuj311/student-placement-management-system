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

export const updateApplication = async (req: Request, res: Response) => {
  try {
    const applicationId = Number(
      req.params.id ?? req.body.applicationId ?? req.query.applicationId,
    );
    const userId = Number(req.body.userId ?? req.query.userId);

    if (Number.isNaN(applicationId) || Number.isNaN(userId)) {
      return res.status(400).json({
        message: "Application ID and user ID are required.",
      });
    }

    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (existingApplication.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Only the related user can update this application." });
    }

    const data: {
      companyName?: string;
      roleApplied?: string;
      resume?: string;
      applicationDate?: Date;
      notes?: string | null;
    } = {};

    if (req.body.companyName !== undefined) {
      const companyName = String(req.body.companyName).trim();

      if (!companyName) {
        return res.status(400).json({ message: "companyName cannot be empty." });
      }

      data.companyName = companyName;
    }

    if (req.body.roleApplied !== undefined) {
      const roleApplied = String(req.body.roleApplied).trim();

      if (!roleApplied) {
        return res.status(400).json({ message: "roleApplied cannot be empty." });
      }

      data.roleApplied = roleApplied;
    }

    if (req.body.resume !== undefined) {
      const resume = String(req.body.resume).trim();

      if (!resume) {
        return res.status(400).json({ message: "resume cannot be empty." });
      }

      data.resume = resume;
    }

    if (req.body.applicationDate !== undefined) {
      const applicationDate = new Date(req.body.applicationDate);

      if (Number.isNaN(applicationDate.getTime())) {
        return res.status(400).json({ message: "Invalid applicationDate." });
      }

      data.applicationDate = applicationDate;
    }

    if (req.body.notes !== undefined) {
      const notes = String(req.body.notes).trim();
      data.notes = notes || null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Nothing to update." });
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data,
      include: applicationInclude,
    });

    return res.status(200).json({
      message: "Application updated successfully.",
      data: application,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;

    if (code === "P2002") {
      return res.status(409).json({
        message: "This application already exists for the same date.",
      });
    }

    return res.status(500).json({ message: "Failed to update application." });
  }
};
