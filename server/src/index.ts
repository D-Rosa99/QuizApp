import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.log(`QuizApp server listening on http://localhost:${config.port}`);
  console.log(`  GET http://localhost:${config.port}/api/categories`);
  console.log(`  GET http://localhost:${config.port}/api/quizzes/:quizId`);
});
