export function getQuestionFeedback(isCorrect: boolean, pointsEarned: number): string {
  if (isCorrect) {
    return `Correct — you earned ${pointsEarned} point${pointsEarned === 1 ? "" : "s"}.`;
  }
  return "Incorrect — review the explanation below.";
}

export function getPerformanceMessage(score: number, maxScore: number): string {
  if (maxScore <= 0) {
    return "Quiz complete.";
  }
  const ratio = score / maxScore;
  if (score === maxScore) {
    return "Perfect score — excellent work on this quiz.";
  }
  if (ratio >= 0.8) {
    return "Great work — you know most of this material.";
  }
  if (ratio >= 0.6) {
    return "Good effort — a few topics to revisit.";
  }
  return "Keep learning — review the explanations and try again.";
}

export function getPercentage(score: number, maxScore: number): number {
  if (maxScore <= 0) {
    return 0;
  }
  return Math.round((score / maxScore) * 100);
}
