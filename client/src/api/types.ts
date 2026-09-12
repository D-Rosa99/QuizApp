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

export type QuizQuestionsResponse = {
  quizId: string;
  quizTitle: string;
  questions: QuestionForPlayer[];
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export type QuestionOption = {
  id: string;
  sortOrder: number;
  label: string;
};

export type QuestionForPlayer = {
  id: string;
  sortOrder: number;
  prompt: string;
  options: QuestionOption[];
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
