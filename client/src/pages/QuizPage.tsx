import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
  createAttempt,
  fetchAttemptPlayState,
  submitQuestionAnswer,
} from "../api/attempts";
import { ApiError } from "../api/client";
import { fetchQuiz, fetchQuizQuestions } from "../api/catalog";
import type {
  AttemptPlayItem,
  QuestionForPlayer,
  QuizDetail,
  SubmissionResult,
} from "../api/types";
import {
  clearStoredAttemptId,
  getParticipantId,
  getStoredAttemptId,
  setStoredAttemptId,
} from "../lib/participant";

type QuestionUiState = {
  selectedOptionId: string | null;
  submitting: boolean;
  submitError: string | null;
  submission: SubmissionResult | null;
  startingAttempt: boolean;
  startAttemptError: string | null;
};

function emptyQuestionState(questions: QuestionForPlayer[]): Record<string, QuestionUiState> {
  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      {
        selectedOptionId: null,
        submitting: false,
        submitError: null,
        submission: null,
        startingAttempt: false,
        startAttemptError: null,
      },
    ]),
  );
}

function buildQuestionStateFromPlay(items: AttemptPlayItem[]): Record<string, QuestionUiState> {
  const map: Record<string, QuestionUiState> = {};
  for (const item of items) {
    map[item.question.id] = {
      selectedOptionId: item.submission?.selectedOptionId ?? null,
      submitting: false,
      submitError: null,
      submission: item.submission,
      startingAttempt: false,
      startAttemptError: null,
    };
  }
  return map;
}

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const startNew = Boolean((location.state as { startNew?: boolean } | null)?.startNew);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionForPlayer[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<"in_progress" | "completed">("in_progress");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [questionState, setQuestionState] = useState<Record<string, QuestionUiState>>({});

  const participantId = useMemo(() => getParticipantId(), []);
  const attemptIdRef = useRef<string | null>(null);
  const attemptStartRef = useRef<Promise<string> | null>(null);

  const syncAttemptId = useCallback((id: string | null) => {
    attemptIdRef.current = id;
    setAttemptId(id);
  }, []);

  const loadQuiz = useCallback(async () => {
    if (!quizId) {
      setLoadError("Missing quiz id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    attemptStartRef.current = null;

    try {
      if (startNew) {
        clearStoredAttemptId(quizId);
        syncAttemptId(null);
      }

      const storedAttemptId = startNew ? null : getStoredAttemptId(quizId);

      if (storedAttemptId) {
        const state = await fetchAttemptPlayState(storedAttemptId, participantId);
        syncAttemptId(state.attempt.id);
        setStoredAttemptId(quizId, state.attempt.id);
        setQuiz({
          id: state.quiz.id,
          categoryId: "",
          slug: "",
          title: state.quiz.title,
          description: state.quiz.description,
          questionCount: state.progress.totalQuestions,
        });
        setQuestions(state.items.map((item) => item.question));
        setQuestionState(buildQuestionStateFromPlay(state.items));
        setAttemptStatus(state.attempt.status);
      } else {
        syncAttemptId(null);
        const [quizDetail, questionsPayload] = await Promise.all([
          fetchQuiz(quizId),
          fetchQuizQuestions(quizId),
        ]);
        setQuiz(quizDetail);
        setQuestions(questionsPayload.questions);
        setQuestionState(emptyQuestionState(questionsPayload.questions));
        setAttemptStatus("in_progress");
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load quiz";
      setLoadError(message);
      setQuiz(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [participantId, quizId, startNew, syncAttemptId]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const ensureAttempt = useCallback(
    async (questionId: string): Promise<string> => {
      if (!quizId) {
        throw new Error("Missing quiz id");
      }

      if (attemptIdRef.current) {
        return attemptIdRef.current;
      }

      if (!attemptStartRef.current) {
        attemptStartRef.current = createAttempt(participantId, quizId, questionId).then(
          (state) => {
            syncAttemptId(state.attempt.id);
            setStoredAttemptId(quizId, state.attempt.id);
            setAttemptStatus(state.attempt.status);
            return state.attempt.id;
          },
        );
      }

      return attemptStartRef.current;
    },
    [participantId, quizId, syncAttemptId],
  );

  const handleSelect = async (questionId: string, optionId: string) => {
    const current = questionState[questionId];
    if (!current || current.submission) {
      return;
    }

    setQuestionState((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
        submitError: null,
        startAttemptError: null,
        startingAttempt: !attemptIdRef.current,
      },
    }));

    if (attemptIdRef.current) {
      return;
    }

    try {
      await ensureAttempt(questionId);
      setQuestionState((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], startingAttempt: false },
      }));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not start attempt";
      attemptStartRef.current = null;
      setQuestionState((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          startingAttempt: false,
          startAttemptError: message,
          selectedOptionId: null,
        },
      }));
    }
  };

  const handleSubmitQuestion = async (questionId: string) => {
    const current = questionState[questionId];
    if (!current?.selectedOptionId || current.submission) {
      return;
    }

    setQuestionState((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], submitting: true, submitError: null },
    }));

    try {
      const activeAttemptId = await ensureAttempt(questionId);
      const response = await submitQuestionAnswer(
        activeAttemptId,
        questionId,
        participantId,
        current.selectedOptionId,
      );

      setQuestionState((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          submitting: false,
          submission: response.result,
        },
      }));
      setAttemptStatus(response.progress.status);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not submit answer";
      setQuestionState((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], submitting: false, submitError: message },
      }));
    }
  };

  const answeredCount = useMemo(
    () => Object.values(questionState).filter((state) => state.submission).length,
    [questionState],
  );

  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 6 }}>
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: 4, mb: 4 }}>
        <Container maxWidth="md">
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            color="inherit"
            sx={{ mb: 2 }}
          >
            Back to categories
          </Button>
          {quiz ? (
            <Stack spacing={1}>
              <Typography variant="h4" component="h1">
                {quiz.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {quiz.description}
              </Typography>
              <Chip
                label={
                  attemptId
                    ? `${answeredCount} / ${totalQuestions} answered`
                    : `${totalQuestions} questions — select an option to begin`
                }
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "inherit",
                }}
              />
            </Stack>
          ) : (
            <Typography variant="h4" component="h1">
              Quiz
            </Typography>
          )}
        </Container>
      </Box>

      <Container maxWidth="md">
        {loading && (
          <Stack alignItems="center" py={8}>
            <CircularProgress />
            <Typography color="text.secondary" mt={2}>
              Loading quiz…
            </Typography>
          </Stack>
        )}

        {!loading && loadError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void loadQuiz()}>
                Retry
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {!loading && quiz && questions.length > 0 && (
          <Stack spacing={3}>
            {attemptId && (
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 8, borderRadius: 1 }}
              />
            )}

            {questions.map((question) => {
              const ui = questionState[question.id];
              const answered = Boolean(ui?.submission);
              const disabled =
                answered || ui?.submitting || ui?.startingAttempt || Boolean(ui?.startAttemptError);

              return (
                <Card key={question.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="overline" color="text.secondary">
                        Question {question.sortOrder}
                      </Typography>

                      <FormControl component="fieldset" fullWidth disabled={disabled}>
                        <FormLabel
                          component="legend"
                          sx={{ color: "text.primary", typography: "h6", mb: 1.5 }}
                        >
                          {question.prompt}
                        </FormLabel>
                        <RadioGroup
                          aria-label={question.prompt}
                          value={ui?.selectedOptionId ?? ""}
                          onChange={(event) =>
                            void handleSelect(question.id, event.target.value)
                          }
                        >
                          <Stack spacing={1}>
                            {question.options.map((option) => (
                              <Box
                                key={option.id}
                                sx={{
                                  border: 1,
                                  borderColor:
                                    ui?.selectedOptionId === option.id
                                      ? "primary.main"
                                      : "divider",
                                  borderRadius: 1,
                                  bgcolor:
                                    ui?.selectedOptionId === option.id
                                      ? "action.selected"
                                      : "background.paper",
                                }}
                              >
                                <FormControlLabel
                                  value={option.id}
                                  control={<Radio />}
                                  label={option.label}
                                  sx={{ m: 0, py: 0.75, px: 1, width: "100%" }}
                                />
                              </Box>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      {ui?.startingAttempt && (
                        <Typography variant="body2" color="text.secondary">
                          Starting your attempt…
                        </Typography>
                      )}

                      {ui?.startAttemptError && (
                        <Alert severity="error">{ui.startAttemptError}</Alert>
                      )}

                      {!answered && (
                        <Box>
                          <Button
                            variant="contained"
                            disabled={
                              !ui?.selectedOptionId ||
                              ui?.submitting ||
                              ui?.startingAttempt ||
                              !attemptId
                            }
                            onClick={() => void handleSubmitQuestion(question.id)}
                          >
                            {ui?.submitting ? "Submitting…" : "Submit answer"}
                          </Button>
                          {ui?.submitError && (
                            <Typography color="error" variant="body2" mt={1}>
                              {ui.submitError}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {ui?.submission && (
                        <Alert
                          severity={ui.submission.isCorrect ? "success" : "warning"}
                          icon={
                            ui.submission.isCorrect ? (
                              <CheckCircleOutlineIcon />
                            ) : (
                              <HighlightOffIcon />
                            )
                          }
                        >
                          <Typography fontWeight={600} gutterBottom>
                            {ui.submission.feedbackMessage}
                          </Typography>
                          <Typography variant="body2">{ui.submission.explanation}</Typography>
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            {attemptStatus === "completed" && (
              <Alert severity="info">
                You&apos;ve answered every question. Final score and results screen arrive in Phase
                4.
              </Alert>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
