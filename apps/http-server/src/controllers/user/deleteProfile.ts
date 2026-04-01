import type { Request, Response } from "express";
import { prisma } from "@repo/db";

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id ?? req.body.userId ?? req.query.userId);

    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    await prisma.$transaction([
      prisma.organizationMembership.deleteMany({ where: { userId } }),
      prisma.application.deleteMany({ where: { userId } }),
      prisma.streak.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return res.status(200).json({
      message: "Profile deleted successfully.",
      data: existingUser,
    });
  } catch {
    return res.status(500).json({ message: "Failed to delete profile." });
  }
};
