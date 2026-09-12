import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createAttemptSchema,
  participantQuerySchema,
  submitAnswerSchema,
} from "../schemas/attempts";
import {
  createAttempt,
  getAttemptPlayState,
  getQuestionForAttempt,
  submitAnswer,
} from "../services/attemptService";

export const attemptsRouter = Router();

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

attemptsRouter.post("/", validateBody(createAttemptSchema), async (req, res, next) => {
  try {
    const { participantId, quizId, questionId } = req.body as {
      participantId: string;
      quizId: string;
      questionId: string;
    };
    const playState = await createAttempt(participantId, quizId, questionId);
    res.status(201).json(playState);
  } catch (err) {
    next(err);
  }
});

attemptsRouter.get(
  "/:attemptId",
  validateQuery(participantQuerySchema),
  async (req, res, next) => {
    try {
      const { participantId } = req.query as { participantId: string };
      const playState = await getAttemptPlayState(routeParam(req.params.attemptId), participantId);
      res.json(playState);
    } catch (err) {
      next(err);
    }
  },
);

attemptsRouter.get(
  "/:attemptId/questions/:questionId",
  validateQuery(participantQuerySchema),
  async (req, res, next) => {
    try {
      const { participantId } = req.query as { participantId: string };
      const question = await getQuestionForAttempt(
        routeParam(req.params.attemptId),
        routeParam(req.params.questionId),
        participantId,
      );
      res.json(question);
    } catch (err) {
      next(err);
    }
  },
);

attemptsRouter.post(
  "/:attemptId/questions/:questionId/submit",
  validateBody(submitAnswerSchema),
  async (req, res, next) => {
    try {
      const { participantId, optionId, idempotencyKey } = req.body as {
        participantId: string;
        optionId: string;
        idempotencyKey?: string;
      };
      const response = await submitAnswer(
        routeParam(req.params.attemptId),
        routeParam(req.params.questionId),
        participantId,
        optionId,
        idempotencyKey,
      );
      res.json(response);
    } catch (err) {
      next(err);
    }
  },
);
