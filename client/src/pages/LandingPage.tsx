import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
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
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { fetchCategories } from "../api/catalog";
import type { CategoriesResponse } from "../api/types";

export function LandingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
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

  const handleQuizClick = (quizId: string) => {
    navigate(`/quiz/${quizId}`, { state: { startNew: true } });
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
                          <ListItemButton onClick={() => handleQuizClick(quiz.id)}>
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
        </Stack>
      </Container>
    </Box>
  );
}
