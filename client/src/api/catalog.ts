import { apiGet } from "./client";
import type { CategoriesResponse, QuizDetail } from "./types";

export function fetchCategories(): Promise<CategoriesResponse> {
  return apiGet<CategoriesResponse>("/api/categories");
}

export function fetchQuiz(quizId: string): Promise<QuizDetail> {
  return apiGet<QuizDetail>(`/api/quizzes/${quizId}`);
}
