import { MembershipStatus, prisma } from "@repo/db";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authenticate.js";

export type OrgRequest = AuthRequest & {
	organizationId?: number;
};

export const orgGuard = async (
	req: OrgRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Authentication required." });
		}

		const organizationId = Number(
			req.params.organizationId ?? req.body.organizationId ?? req.query.organizationId,
		);

		if (Number.isNaN(organizationId) || organizationId <= 0) {
			return res.status(400).json({ message: "Organization ID is required." });
		}

		const membership = await prisma.organizationMembership.findUnique({
			where: {
				userId_organizationId: {
					userId: req.user.id,
					organizationId,
				},
			},
		});

		if (!membership || membership.status !== MembershipStatus.ACTIVE) {
			return res.status(403).json({ message: "Organization access denied." });
		}

		req.organizationId = organizationId;
		next();
	} catch {
		return res.status(500).json({ message: "Organization validation failed." });
	}
};
