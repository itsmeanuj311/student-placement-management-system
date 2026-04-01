import type { Request } from "express";

export const getPagination = (query: Request["query"]) => {
	const page = Math.max(1, Number(query.page ?? 1));
	const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
	const skip = (page - 1) * limit;

	return { page, limit, skip };
};

export const getPaginationMeta = (total: number, page: number, limit: number) => {
	return {
		total,
		page,
		limit,
		totalPages: Math.max(1, Math.ceil(total / limit)),
	};
};
