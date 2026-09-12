import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { fetchCategories, fetchQuiz } from "../api/catalog";
import type { CategoriesResponse, QuizDetail } from "../api/types";

export function LandingPage() {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetail | null>(null);
  const [quizLoadingId, setQuizLoadingId] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedQuiz(null);
    setQuizError(null);
    try {
      const response = await fetchCategories();
      setData(response);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load categories";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleQuizClick = async (quizId: string) => {
    setQuizLoadingId(quizId);
    setQuizError(null);
    try {
      const quiz = await fetchQuiz(quizId);
      setSelectedQuiz(quiz);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load quiz";
      setQuizError(message);
      setSelectedQuiz(null);
    } finally {
      setQuizLoadingId(null);
    }
  };

  const totalQuizzes =
    data?.categories.reduce((sum, c) => sum + c.quizzes.length, 0) ?? 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 6 }}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 5, md: 7 },
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="flex-start">
            <Chip
              icon={<QuizOutlinedIcon />}
              label="AI education"
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "inherit",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
            <Typography variant="h3" component="h1">
              QuizApp
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 640, opacity: 0.92 }}>
              Practice AI development topics with short multiple-choice quizzes.
              Pick a category below to explore what&apos;s available.
            </Typography>
            {!loading && data && (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {data.categories.length} categories · {totalQuizzes} quizzes
                loaded from the API
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2">
              Quiz categories
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => void loadCategories()}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          {loading && (
            <Stack alignItems="center" py={6}>
              <CircularProgress />
              <Typography color="text.secondary" mt={2}>
                Loading categories…
              </Typography>
            </Stack>
          )}

          {!loading && error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void loadCategories()}>
                  Retry
                </Button>
              }
            >
              {error}. Make sure the API is running on port 3001 (
              <code>npm run dev:server</code>).
            </Alert>
          )}

          {!loading && data && (
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={3}
            >
              {data.categories.map((category) => (
                <Card key={category.id} variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      {category.slug}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {category.description}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <List dense disablePadding>
                      {category.quizzes.map((quiz) => (
                        <ListItem key={quiz.id} disablePadding>
                          <ListItemButton
                            selected={selectedQuiz?.id === quiz.id}
                            onClick={() => void handleQuizClick(quiz.id)}
                            disabled={quizLoadingId === quiz.id}
                          >
                            <ListItemText
                              primary={quiz.title}
                              secondary={quiz.description}
                            />
                            <Chip
                              size="small"
                              label={`${quiz.questionCount} Q`}
                              color="secondary"
                              variant="outlined"
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {quizError && <Alert severity="warning">{quizError}</Alert>}

          {(data || selectedQuiz) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>API responses (debug)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {data && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        GET /api/categories
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 2,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          overflow: "auto",
                          fontSize: 12,
                        }}
                      >
                        {JSON.stringify(data, null, 2)}
                      </Box>
                    </Box>
                  )}
                  {selectedQuiz && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        GET /api/quizzes/{selectedQuiz.id}
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 2,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          overflow: "auto",
                          fontSize: 12,
                        }}
                      >
                        {JSON.stringify(selectedQuiz, null, 2)}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
