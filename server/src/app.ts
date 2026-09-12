import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { attemptsRouter } from "./routes/attempts";
import { categoriesRouter } from "./routes/categories";
import { quizzesRouter } from "./routes/quizzes";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/categories", categoriesRouter);
  app.use("/api/quizzes", quizzesRouter);
  app.use("/api/attempts", attemptsRouter);

  app.use(errorHandler);

  return app;
}
