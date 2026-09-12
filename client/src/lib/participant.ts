const PARTICIPANT_KEY = "quizapp:participantId";

function generateParticipantId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const r = (Math.random() * 16) | 0;
    const v = char === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getParticipantId(): string {
  const existing = localStorage.getItem(PARTICIPANT_KEY);
  if (existing) {
    return existing;
  }
  const id = generateParticipantId();
  localStorage.setItem(PARTICIPANT_KEY, id);
  return id;
}

export function attemptStorageKey(quizId: string): string {
  return `quizapp:attempt:${quizId}`;
}

export function getStoredAttemptId(quizId: string): string | null {
  return sessionStorage.getItem(attemptStorageKey(quizId));
}

export function setStoredAttemptId(quizId: string, attemptId: string): void {
  sessionStorage.setItem(attemptStorageKey(quizId), attemptId);
}

export function clearStoredAttemptId(quizId: string): void {
  sessionStorage.removeItem(attemptStorageKey(quizId));
}
