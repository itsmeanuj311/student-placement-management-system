import { MembershipStatus, prisma } from "@repo/db";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
	try {
		const includeInactive = String(req.query.includeInactive ?? "false") === "true";

		const organizations = await prisma.orgAdmin.findMany({
			where: includeInactive ? {} : { isActive: true, isBanned: false },
			select: {
				id: true,
				email: true,
				organizationName: true,
				organizationBio: true,
				organizationLogo: true,
				isActive: true,
				isBanned: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return res.status(200).json({
			message: "Organizations fetched successfully.",
			data: {
				count: organizations.length,
				organizations,
			},
		});
	} catch {
		return res.status(500).json({ message: "Failed to get organizations." });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (Number.isNaN(id) || id <= 0) {
			return res.status(400).json({ message: "Valid organization ID is required." });
		}

		const organization = await prisma.orgAdmin.findUnique({
			where: { id },
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
			return res.status(404).json({ message: "Organization not found." });
		}

		return res.status(200).json({
			message: "Organization fetched successfully.",
			data: organization,
		});
	} catch {
		return res.status(500).json({ message: "Failed to get organization." });
	}
});

router.post("/join", async (req, res) => {
	try {
		const userId = Number(req.body.userId);
		const inviteCode = String(req.body.inviteCode ?? "").trim();

		if (Number.isNaN(userId) || userId <= 0 || !inviteCode) {
			return res.status(400).json({ message: "User ID and invite code are required." });
		}

		const organization = await prisma.orgAdmin.findUnique({
			where: { inviteCode },
			select: { id: true, organizationName: true, isActive: true, isBanned: true },
		});

		if (!organization || !organization.isActive || organization.isBanned) {
			return res.status(404).json({ message: "Organization not found or not active." });
		}

		const existingMembership = await prisma.organizationMembership.findUnique({
			where: {
				userId_organizationId: {
					userId,
					organizationId: organization.id,
				},
			},
		});

		if (existingMembership && existingMembership.status === MembershipStatus.ACTIVE) {
			return res.status(200).json({
				message: "User is already a member of this organization.",
				data: existingMembership,
			});
		}

		const membership = existingMembership
			? await prisma.organizationMembership.update({
					where: { id: existingMembership.id },
					data: { status: MembershipStatus.PENDING, inviteCodeUsed: inviteCode },
				})
			: await prisma.organizationMembership.create({
					data: {
						userId,
						organizationId: organization.id,
						inviteCodeUsed: inviteCode,
						status: MembershipStatus.PENDING,
					},
				});

		return res.status(201).json({
			message: "Join request sent successfully.",
			data: {
				organization,
				membership,
			},
		});
	} catch {
		return res.status(500).json({ message: "Failed to join organization." });
	}
});

export default router;
