import type { Response } from "express";

export const sendSuccess = <T>(
	res: Response,
	data: T,
	message = "Success",
	status = 200,
) => {
	return res.status(status).json({ message, data });
};

export const sendError = (res: Response, message: string, status = 400) => {
	return res.status(status).json({ message });
};
