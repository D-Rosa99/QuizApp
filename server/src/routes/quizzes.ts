import { Router } from "express";
import { getQuizById, listQuizQuestions } from "../services/catalogService";

export const quizzesRouter = Router();

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

quizzesRouter.get("/:quizId/questions", async (req, res, next) => {
  try {
    const payload = await listQuizQuestions(routeParam(req.params.quizId));
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

quizzesRouter.get("/:quizId", async (req, res, next) => {
  try {
    const quiz = await getQuizById(routeParam(req.params.quizId));
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});
