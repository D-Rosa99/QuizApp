export type QuizSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  questionCount: number;
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  quizzes: QuizSummary[];
};

export type CategoriesResponse = {
  categories: Category[];
};

export type QuizDetail = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  questionCount: number;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};
