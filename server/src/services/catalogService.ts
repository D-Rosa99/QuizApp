import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      quizzes: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
  });

  return {
    categories: categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      title: category.title,
      description: category.description,
      quizzes: category.quizzes.map((quiz) => ({
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz._count.questions,
      })),
    })),
  };
}

export async function getQuizById(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      _count: { select: { questions: true } },
    },
  });

  if (!quiz) {
    throw new AppError(404, "NOT_FOUND", "Quiz not found");
  }

  return {
    id: quiz.id,
    categoryId: quiz.categoryId,
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    questionCount: quiz._count.questions,
  };
}

export async function listQuizQuestions(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, title: true },
  });

  if (!quiz) {
    throw new AppError(404, "NOT_FOUND", "Quiz not found");
  }

  const questions = await prisma.question.findMany({
    where: { quizId },
    include: { options: true },
    orderBy: { sortOrder: "asc" },
  });

  return {
    quizId: quiz.id,
    quizTitle: quiz.title,
    questions: questions.map((question) => ({
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
    })),
  };
}
