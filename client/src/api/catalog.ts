import { apiGet } from "./client";
import type { CategoriesResponse, QuizDetail, QuizQuestionsResponse } from "./types";

export function fetchCategories(): Promise<CategoriesResponse> {
  return apiGet<CategoriesResponse>("/api/categories");
}

export function fetchQuiz(quizId: string): Promise<QuizDetail> {
  return apiGet<QuizDetail>(`/api/quizzes/${quizId}`);
}

export function fetchQuizQuestions(quizId: string): Promise<QuizQuestionsResponse> {
  return apiGet<QuizQuestionsResponse>(`/api/quizzes/${quizId}/questions`);
}
