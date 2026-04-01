const now = () => new Date().toISOString();

export const logger = {
	info: (message: string) => console.log(`[INFO] ${now()} ${message}`),
	warn: (message: string) => console.warn(`[WARN] ${now()} ${message}`),
	error: (message: string) => console.error(`[ERROR] ${now()} ${message}`),
};
