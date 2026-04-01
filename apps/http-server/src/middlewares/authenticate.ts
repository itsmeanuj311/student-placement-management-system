import { prisma } from "@repo/db";
import type { NextFunction, Request, Response } from "express";

export type AuthRequest = Request & {
	user?: {
		id: number;
		role: "USER" | "ADMIN" | "SUPER_ADMIN";
	};
};

export const authenticate = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rawUserId = req.header("x-user-id") ?? req.query.userId ?? req.body?.userId;
		const userId = Number(rawUserId);

		if (Number.isNaN(userId) || userId <= 0) {
			return res.status(401).json({ message: "Authentication required." });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, role: true, isBanned: true },
		});

		if (user && !user.isBanned) {
			req.user = { id: user.id, role: user.role };
			next();
			return;
		}

		const admin = await prisma.orgAdmin.findUnique({
			where: { id: userId },
			select: { id: true, role: true, isBanned: true, isActive: true },
		});

		if (admin && admin.isActive && !admin.isBanned) {
			req.user = { id: admin.id, role: admin.role };
			next();
			return;
		}

		const superAdmin = await prisma.superAdmin.findUnique({
			where: { id: userId },
			select: { id: true, role: true },
		});

		if (!superAdmin) {
			return res.status(401).json({ message: "Invalid user." });
		}

		req.user = { id: superAdmin.id, role: superAdmin.role };
		next();
	} catch {
		return res.status(500).json({ message: "Authentication failed." });
	}
};
