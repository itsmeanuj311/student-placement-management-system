import cors from "cors";
import express from "express";
import helmet from "helmet";
import applicationRouter from "./routes/application.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import organizationRouter from "./routes/organization.js";
import userRouter from "./routes/user.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(requestLogger);
app.use(apiLimiter);

app.get("/health", (_req, res) => {
	return res.status(200).json({ message: "Server is running." });
});

app.use("/users", userRouter);
app.use("/applications", applicationRouter);
app.use("/organizations", organizationRouter);

app.use((_req, res) => {
	return res.status(404).json({ message: "Route not found." });
});

app.use(errorHandler);

export default app;
