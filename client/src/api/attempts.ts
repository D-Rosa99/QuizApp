import { apiGet, apiPost } from "./client";
import type { AttemptPlayState, SubmitAnswerResponse } from "./types";

export async function createAttempt(
  participantId: string,
  quizId: string,
  questionId: string,
): Promise<AttemptPlayState> {
  return apiPost<AttemptPlayState>("/api/attempts", {
    participantId,
    quizId,
    questionId,
  });
}

export async function fetchAttemptPlayState(
  attemptId: string,
  participantId: string,
): Promise<AttemptPlayState> {
  const query = new URLSearchParams({ participantId });
  return apiGet<AttemptPlayState>(`/api/attempts/${attemptId}?${query}`);
}

export async function submitQuestionAnswer(
  attemptId: string,
  questionId: string,
  participantId: string,
  optionId: string,
): Promise<SubmitAnswerResponse> {
  return apiPost<SubmitAnswerResponse>(
    `/api/attempts/${attemptId}/questions/${questionId}/submit`,
    { participantId, optionId },
  );
}
