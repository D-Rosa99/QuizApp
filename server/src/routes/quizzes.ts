import { Router } from "express";
import { getQuizById } from "../services/catalogService";

export const quizzesRouter = Router();

quizzesRouter.get("/:quizId", async (req, res, next) => {
  try {
    const quiz = await getQuizById(req.params.quizId);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});
