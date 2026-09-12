import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  const base = `http://localhost:${config.port}`;
  console.log(`QuizApp server listening on ${base}`);
  console.log(`  GET ${base}/api/categories`);
  console.log(`  GET ${base}/api/quizzes/:quizId`);
  console.log(`  GET ${base}/api/quizzes/:quizId/questions`);
  console.log(`  POST ${base}/api/attempts`);
  console.log(`  GET ${base}/api/attempts/:attemptId?participantId=`);
});
