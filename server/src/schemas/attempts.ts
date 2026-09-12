import { z } from "zod";

export const createAttemptSchema = z.object({
  participantId: z.string().uuid(),
  quizId: z.string().min(1),
  questionId: z.string().min(1),
});

export const participantQuerySchema = z.object({
  participantId: z.string().uuid(),
});

export const submitAnswerSchema = z.object({
  participantId: z.string().uuid(),
  optionId: z.string().min(1),
  idempotencyKey: z.string().min(1).optional(),
});
