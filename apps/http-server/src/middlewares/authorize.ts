import type { Role } from "@repo/db";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authenticate.js";

export const authorize = (allowedRoles: Role[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: "Authentication required." });
		}

		if (!allowedRoles.includes(req.user.role as Role)) {
			return res.status(403).json({ message: "Access denied." });
		}

		next();
	};
};
