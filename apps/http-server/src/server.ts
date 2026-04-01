import "dotenv/config";
import app from "./app.js";

const processRef = globalThis as {
	process?: { env?: Record<string, string | undefined> };
};

const portValue = Number.parseInt(processRef.process?.env?.PORT ?? "3000", 10);
const port = Number.isNaN(portValue) ? 3000 : portValue;

app.listen(port, () => {
	console.log(`HTTP server started on port ${port}`);
});
