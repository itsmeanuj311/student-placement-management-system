import type { Request, Response } from "express";
import { prisma } from "@repo/db";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id ?? req.body.userId ?? req.query.userId);

    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const data: {
      fullName?: string | null;
      username?: string | null;
      bio?: string | null;
      photo?: string | null;
      jobRole?: string | null;
      certifications?: string[];
    } = {};

    if (req.body.fullName !== undefined) {
      const fullName = String(req.body.fullName).trim();
      data.fullName = fullName || null;
    }

    if (req.body.username !== undefined) {
      const username = String(req.body.username).trim();
      data.username = username || null;
    }

    if (req.body.bio !== undefined) {
      const bio = String(req.body.bio).trim();
      data.bio = bio || null;
    }

    if (req.body.photo !== undefined) {
      const photo = String(req.body.photo).trim();
      data.photo = photo || null;
    }

    if (req.body.jobRole !== undefined) {
      const jobRole = String(req.body.jobRole).trim();
      data.jobRole = jobRole || null;
    }

    if (req.body.certifications !== undefined) {
      if (!Array.isArray(req.body.certifications)) {
        return res.status(400).json({
          message: "certifications must be an array of strings.",
        });
      }

      data.certifications = req.body.certifications
        .map((item: unknown) => String(item).trim())
        .filter(Boolean);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Nothing to update." });
    }

    const profile = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        bio: true,
        photo: true,
        jobRole: true,
        certifications: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;

    if (code === "P2002") {
      return res.status(409).json({ message: "Username already exists." });
    }

    return res.status(500).json({ message: "Failed to update profile." });
  }
};
