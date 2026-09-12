import type { Option, Question } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  getPercentage,
  getPerformanceMessage,
  getQuestionFeedback,
} from "./scoringService";

type QuestionWithOptions = Question & { options: Option[] };

export type QuestionForPlayer = {
  id: string;
  sortOrder: number;
  prompt: string;
  options: Array<{ id: string; sortOrder: number; label: string }>;
};

export type SubmissionResult = {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string;
  feedbackMessage: string;
};

export type AttemptPlayItem = {
  question: QuestionForPlayer;
  submission: SubmissionResult | null;
};

export type AttemptPlayState = {
  attempt: {
    id: string;
    quizId: string;
    status: "in_progress" | "completed";
    totalQuestions: number;
  };
  quiz: {
    id: string;
    title: string;
    description: string;
  };
  progress: {
    answeredCount: number;
    totalQuestions: number;
    status: "in_progress" | "completed";
  };
  items: AttemptPlayItem[];
};

function toQuestionForPlayer(question: QuestionWithOptions): QuestionForPlayer {
  return {
    id: question.id,
    sortOrder: question.sortOrder,
    prompt: question.prompt,
    options: question.options
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((option) => ({
        id: option.id,
        sortOrder: option.sortOrder,
        label: option.label,
      })),
  };
}

function toSubmissionResult(
  question: QuestionWithOptions,
  selectedOptionId: string,
  isCorrect: boolean,
  pointsEarned: number,
): SubmissionResult {
  return {
    questionId: question.id,
    selectedOptionId,
    isCorrect,
    pointsEarned,
    explanation: question.explanation,
    feedbackMessage: getQuestionFeedback(isCorrect, pointsEarned),
  };
}

async function loadQuizQuestions(quizId: string): Promise<QuestionWithOptions[]> {
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: { options: true },
    orderBy: { sortOrder: "asc" },
  });
  return questions;
}

async function buildPlayState(
  attemptId: string,
  participantId: string,
): Promise<AttemptPlayState> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
      answers: true,
    },
  });

  if (!attempt) {
    throw new AppError(404, "NOT_FOUND", "Attempt not found");
  }

  if (attempt.participantId !== participantId) {
    throw new AppError(403, "FORBIDDEN", "Attempt does not belong to this participant");
  }

  const questions = await loadQuizQuestions(attempt.quizId);
  const answerByQuestion = new Map(
    attempt.answers.map((answer) => [answer.questionId, answer]),
  );

  const items: AttemptPlayItem[] = questions.map((question) => {
    const answer = answerByQuestion.get(question.id);
    if (!answer) {
      return { question: toQuestionForPlayer(question), submission: null };
    }
    return {
      question: toQuestionForPlayer(question),
      submission: toSubmissionResult(
        question,
        answer.optionId,
        answer.isCorrect,
        answer.pointsEarned,
      ),
    };
  });

  const answeredCount = attempt.answers.length;
  const totalQuestions = questions.length;

  return {
    attempt: {
      id: attempt.id,
      quizId: attempt.quizId,
      status: attempt.status,
      totalQuestions,
    },
    quiz: {
      id: attempt.quiz.id,
      title: attempt.quiz.title,
      description: attempt.quiz.description,
    },
    progress: {
      answeredCount,
      totalQuestions,
      status: attempt.status,
    },
    items,
  };
}

export async function createAttempt(
  participantId: string,
  quizId: string,
  questionId: string,
): Promise<AttemptPlayState> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { _count: { select: { questions: true } } },
  });

  if (!quiz) {
    throw new AppError(404, "NOT_FOUND", "Quiz not found");
  }

  if (quiz._count.questions === 0) {
    throw new AppError(500, "INTERNAL_ERROR", "Quiz has no questions");
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId },
    select: { id: true },
  });

  if (!question) {
    throw new AppError(404, "NOT_FOUND", "Question not found in this quiz");
  }

  await prisma.participant.upsert({
    where: { id: participantId },
    create: { id: participantId },
    update: { lastSeenAt: new Date() },
  });

  const attempt = await prisma.attempt.create({
    data: {
      participantId,
      quizId,
      status: "in_progress",
    },
  });

  return buildPlayState(attempt.id, participantId);
}

export async function getAttemptPlayState(
  attemptId: string,
  participantId: string,
): Promise<AttemptPlayState> {
  return buildPlayState(attemptId, participantId);
}

export async function getQuestionForAttempt(
  attemptId: string,
  questionId: string,
  participantId: string,
): Promise<QuestionForPlayer> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new AppError(404, "NOT_FOUND", "Attempt not found");
  }

  if (attempt.participantId !== participantId) {
    throw new AppError(403, "FORBIDDEN", "Attempt does not belong to this participant");
  }

  if (attempt.status !== "in_progress") {
    throw new AppError(409, "ATTEMPT_COMPLETED", "Attempt is already completed");
  }

  const existing = await prisma.attemptAnswer.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } },
  });

  if (existing) {
    throw new AppError(409, "QUESTION_ALREADY_ANSWERED", "Question already answered");
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId: attempt.quizId },
    include: { options: true },
  });

  if (!question) {
    throw new AppError(404, "NOT_FOUND", "Question not found");
  }

  return toQuestionForPlayer(question);
}

export type SubmitAnswerResponse = {
  result: SubmissionResult;
  progress: {
    answeredCount: number;
    totalQuestions: number;
    status: "in_progress" | "completed";
  };
  completion: {
    score: number;
    maxScore: number;
    percentage: number;
    performanceMessage: string;
  } | null;
};

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  participantId: string,
  optionId: string,
  idempotencyKey?: string,
): Promise<SubmitAnswerResponse> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: { include: { questions: true } },
    },
  });

  if (!attempt) {
    throw new AppError(404, "NOT_FOUND", "Attempt not found");
  }

  if (attempt.participantId !== participantId) {
    throw new AppError(403, "FORBIDDEN", "Attempt does not belong to this participant");
  }

  if (attempt.status === "completed") {
    throw new AppError(409, "ATTEMPT_COMPLETED", "Attempt is already completed");
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId: attempt.quizId },
    include: { options: true },
  });

  if (!question) {
    throw new AppError(404, "NOT_FOUND", "Question not found");
  }

  const existing = await prisma.attemptAnswer.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } },
  });

  if (existing) {
    if (existing.optionId !== optionId) {
      throw new AppError(409, "ALREADY_ANSWERED", "Question already answered with a different option");
    }

    const totalQuestions = attempt.quiz.questions.length;
    const answeredCount = attempt.answers.length;
    const result = toSubmissionResult(
      question,
      existing.optionId,
      existing.isCorrect,
      existing.pointsEarned,
    );

    return {
      result,
      progress: {
        answeredCount,
        totalQuestions,
        status: attempt.status,
      },
      completion: null,
    };
  }

  const option = question.options.find((o) => o.id === optionId);
  if (!option) {
    throw new AppError(400, "VALIDATION_ERROR", "Option does not belong to this question");
  }

  const isCorrect = option.isCorrect;
  const pointsEarned = isCorrect ? 1 : 0;

  const totalQuestions = attempt.quiz.questions.length;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.attemptAnswer.create({
      data: {
        attemptId,
        questionId,
        optionId,
        isCorrect,
        pointsEarned,
        idempotencyKey,
      },
    });

    const allAnswers = await tx.attemptAnswer.findMany({
      where: { attemptId },
    });

    const answeredCount = allAnswers.length;
    const allAnswered = answeredCount >= totalQuestions;

    if (allAnswered) {
      const score = allAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
      const maxScore = totalQuestions;
      const performanceMessage = getPerformanceMessage(score, maxScore);

      return tx.attempt.update({
        where: { id: attemptId },
        data: {
          status: "completed",
          score,
          maxScore,
          performanceMessage,
          completedAt: new Date(),
        },
      });
    }

    return tx.attempt.findUniqueOrThrow({ where: { id: attemptId } });
  });

  const result = toSubmissionResult(question, optionId, isCorrect, pointsEarned);
  const answeredCount = attempt.answers.length + 1;

  let completion: SubmitAnswerResponse["completion"] = null;
  if (updated.status === "completed" && updated.score != null && updated.maxScore != null) {
    completion = {
      score: updated.score,
      maxScore: updated.maxScore,
      percentage: getPercentage(updated.score, updated.maxScore),
      performanceMessage:
        updated.performanceMessage ?? getPerformanceMessage(updated.score, updated.maxScore),
    };
  }

  return {
    result,
    progress: {
      answeredCount,
      totalQuestions,
      status: updated.status,
    },
    completion,
  };
}
