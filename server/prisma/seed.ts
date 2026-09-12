import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedOption = { label: string; isCorrect?: boolean };
type SeedQuestion = {
  prompt: string;
  explanation: string;
  options: SeedOption[];
};

type SeedQuiz = {
  slug: string;
  title: string;
  description: string;
  questions: SeedQuestion[];
};

type SeedCategory = {
  slug: string;
  title: string;
  description: string;
  quizzes: SeedQuiz[];
};

const catalog: SeedCategory[] = [
  {
    slug: "llm-fundamentals",
    title: "LLM Fundamentals",
    description:
      "Core concepts behind large language models: tokens, context, and prompting.",
    quizzes: [
      {
        slug: "tokens-and-context",
        title: "Tokens & Context",
        description: "How text becomes tokens and what fits in a context window.",
        questions: [
          {
            prompt: "What is a token in the context of LLMs?",
            explanation:
              "Models process text as tokens—chunks of characters or subwords—not raw characters. Tokenization affects cost, speed, and context limits.",
            options: [
              { label: "A single English word only" },
              { label: "A unit of text the model reads and generates", isCorrect: true },
              { label: "A database row storing chat history" },
              { label: "A GPU memory allocation" },
            ],
          },
          {
            prompt: "Why does context window size matter?",
            explanation:
              "The context window caps how much input (and often output) the model can consider at once. Exceeding it truncates or fails the request.",
            options: [
              { label: "It limits how much text the model can use in one request", isCorrect: true },
              { label: "It sets the maximum training dataset size" },
              { label: "It controls the number of API keys per account" },
              { label: "It only affects image models" },
            ],
          },
          {
            prompt: "Which factor typically increases token usage for the same idea?",
            explanation:
              "Verbose prompts, few-shot examples, and tool outputs all add tokens. Concise structured prompts often save cost and leave room for answers.",
            options: [
              { label: "Shorter system prompts" },
              { label: "More examples and longer instructions in the prompt", isCorrect: true },
              { label: "Lower temperature" },
              { label: "Using JSON mode" },
            ],
          },
          {
            prompt: "What happens when input exceeds the model's context limit?",
            explanation:
              "Providers usually reject the request or truncate input according to their API rules. Design apps to summarize or chunk long documents.",
            options: [
              { label: "The model automatically compresses without loss" },
              { label: "The request may be rejected or truncated", isCorrect: true },
              { label: "Tokens are free for overflow" },
              { label: "Only the system prompt is removed" },
            ],
          },
          {
            prompt: "Roughly, why might 'hello' and a rare word tokenize differently?",
            explanation:
              "Common words may be one token; rare words split into multiple subword tokens. This is why token counts are not equal to word counts.",
            options: [
              { label: "All words are always one token" },
              { label: "Tokenizers split text into learned subword pieces", isCorrect: true },
              { label: "Only punctuation creates tokens" },
              { label: "Tokenization is random per request" },
            ],
          },
        ],
      },
      {
        slug: "sampling-and-prompts",
        title: "Sampling & Prompts",
        description: "Temperature, system prompts, and controlling model behavior.",
        questions: [
          {
            prompt: "What does temperature control during text generation?",
            explanation:
              "Temperature scales randomness in sampling. Lower values are more deterministic; higher values increase diversity and risk of drift.",
            options: [
              { label: "GPU heat management" },
              { label: "Randomness of token selection", isCorrect: true },
              { label: "Maximum response length in tokens" },
              { label: "Encryption strength of the API" },
            ],
          },
          {
            prompt: "What is the main purpose of a system prompt?",
            explanation:
              "System messages set persistent instructions, persona, and constraints that apply across the conversation unless overridden.",
            options: [
              { label: "Store user passwords" },
              { label: "Set high-level behavior and rules for the assistant", isCorrect: true },
              { label: "Replace the need for a user message" },
              { label: "Enable database migrations" },
            ],
          },
          {
            prompt: "When is lower temperature usually preferred?",
            explanation:
              "Tasks needing factual consistency, formatting, or extraction benefit from lower temperature to reduce creative variance.",
            options: [
              { label: "Creative brainstorming only" },
              { label: "Structured extraction or strict formatting tasks", isCorrect: true },
              { label: "Never; always use maximum temperature" },
              { label: "Only during model training" },
            ],
          },
          {
            prompt: "What is few-shot prompting?",
            explanation:
              "Providing input-output examples in the prompt helps the model mimic a pattern without weight updates.",
            options: [
              { label: "Training a model with one example" },
              { label: "Including example pairs in the prompt to guide behavior", isCorrect: true },
              { label: "Running the model five times" },
              { label: "Using five system prompts" },
            ],
          },
          {
            prompt: "Why specify output format (e.g. JSON) in the prompt?",
            explanation:
              "Clear format instructions reduce parsing errors and make downstream code reliable. Combine with validation after generation.",
            options: [
              { label: "It disables the model's knowledge" },
              { label: "It helps the model produce machine-readable responses", isCorrect: true },
              { label: "It increases context window size" },
              { label: "It is required for temperature to work" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "rag-and-retrieval",
    title: "RAG & Retrieval",
    description: "Grounding LLMs with retrieval, embeddings, and chunking.",
    quizzes: [
      {
        slug: "embeddings-basics",
        title: "Embeddings Basics",
        description: "Vector representations and similarity search.",
        questions: [
          {
            prompt: "What is an embedding in retrieval systems?",
            explanation:
              "Embeddings map text to dense vectors so semantic similarity can be approximated by distance metrics in vector space.",
            options: [
              { label: "A compressed PNG of a document" },
              { label: "A numerical vector representing meaning", isCorrect: true },
              { label: "A SQL primary key" },
              { label: "A lossless text hash" },
            ],
          },
          {
            prompt: "What does a vector database primarily optimize?",
            explanation:
              "Vector stores index embeddings for fast approximate nearest-neighbor search at scale.",
            options: [
              { label: "Relational joins on foreign keys" },
              { label: "Similarity search over high-dimensional vectors", isCorrect: true },
              { label: "Storing raw HTML only" },
              { label: "Compiling TypeScript" },
            ],
          },
          {
            prompt: "Why might two paraphrases have close embeddings?",
            explanation:
              "Embedding models are trained so semantically similar text lands near each other, even with different wording.",
            options: [
              { label: "They always share identical tokens" },
              { label: "The model places similar meaning nearby in vector space", isCorrect: true },
              { label: "Vector DBs copy vectors automatically" },
              { label: "Only identical strings embed similarly" },
            ],
          },
          {
            prompt: "What is cosine similarity often used for?",
            explanation:
              "Cosine similarity measures the angle between vectors and is common when magnitude matters less than direction.",
            options: [
              { label: "Comparing embedding direction regardless of length", isCorrect: true },
              { label: "Measuring file size on disk" },
              { label: "Encrypting embeddings" },
              { label: "Sorting documents alphabetically" },
            ],
          },
          {
            prompt: "What is a common failure mode of naive embedding search?",
            explanation:
              "Lexically similar but wrong passages, or missing nuance, can rank highly. Hybrid search and reranking help.",
            options: [
              { label: "It always returns perfect answers" },
              { label: "Retrieving plausible but irrelevant chunks", isCorrect: true },
              { label: "It cannot run on CPUs" },
              { label: "Embeddings expire after one hour" },
            ],
          },
        ],
      },
      {
        slug: "rag-pipeline",
        title: "RAG Pipeline",
        description: "Chunking, retrieval, and grounding answers in sources.",
        questions: [
          {
            prompt: "What does RAG stand for?",
            explanation:
              "Retrieval-Augmented Generation combines search over a knowledge base with LLM generation grounded in retrieved context.",
            options: [
              { label: "Random API Gateway" },
              { label: "Retrieval-Augmented Generation", isCorrect: true },
              { label: "Recursive Auto Gradient" },
              { label: "Relational Aggregate Graph" },
            ],
          },
          {
            prompt: "Why chunk long documents before indexing?",
            explanation:
              "Chunks fit embedding limits and improve precision; overly large chunks dilute relevance.",
            options: [
              { label: "To break encryption" },
              { label: "To match embedding limits and improve retrieval precision", isCorrect: true },
              { label: "Because LLMs cannot read paragraphs" },
              { label: "To remove all metadata" },
            ],
          },
          {
            prompt: "What should the generator cite when using RAG?",
            explanation:
              "Ground answers in retrieved passages and cite sources so users can verify and trust outputs.",
            options: [
              { label: "Only the model's pretraining data" },
              { label: "Retrieved source passages relevant to the query", isCorrect: true },
              { label: "Random Wikipedia titles" },
              { label: "API rate limit headers" },
            ],
          },
          {
            prompt: "What is hallucination in RAG context?",
            explanation:
              "The model may invent facts not supported by retrieved chunks. Strong prompts and citation checks reduce this.",
            options: [
              { label: "When the vector DB is offline" },
              { label: "Generating claims not supported by retrieved evidence", isCorrect: true },
              { label: "Compressing embeddings" },
              { label: "Using too small a chunk size" },
            ],
          },
          {
            prompt: "What is a reranker used for?",
            explanation:
              "Rerankers score top-k retrieval results with a heavier model to improve ordering before generation.",
            options: [
              { label: "Re-sort candidate chunks for better relevance", isCorrect: true },
              { label: "Train the LLM from scratch" },
              { label: "Delete duplicate users" },
              { label: "Replace embeddings with keywords only" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "ai-engineering-safety",
    title: "AI Engineering & Safety",
    description: "Evals, guardrails, and building reliable AI features.",
    quizzes: [
      {
        slug: "evals-and-metrics",
        title: "Evals & Metrics",
        description: "Measuring quality before and after shipping.",
        questions: [
          {
            prompt: "Why run evals on a golden dataset?",
            explanation:
              "Curated examples with expected outcomes detect regressions when prompts, models, or retrieval change.",
            options: [
              { label: "To replace unit tests entirely" },
              { label: "To measure quality consistently across changes", isCorrect: true },
              { label: "To increase token usage" },
              { label: "To disable logging" },
            ],
          },
          {
            prompt: "What is LLM-as-judge often used for?",
            explanation:
              "Another model scores outputs against rubrics when human labels are expensive, with known bias risks.",
            options: [
              { label: "Automated scoring of responses against criteria", isCorrect: true },
              { label: "Training GPUs faster" },
              { label: "Storing embeddings" },
              { label: "Generating API keys" },
            ],
          },
          {
            prompt: "What does precision measure in retrieval evals?",
            explanation:
              "Precision is the fraction of retrieved items that are relevant—important when showing few results.",
            options: [
              { label: "Share of retrieved items that are relevant", isCorrect: true },
              { label: "Total documents in the index" },
              { label: "Model parameter count" },
              { label: "API latency p99 only" },
            ],
          },
          {
            prompt: "When should you A/B test a prompt change?",
            explanation:
              "When user-facing quality or business metrics might shift, compare variants with real traffic or shadow traffic.",
            options: [
              { label: "Never; first prompt is final" },
              { label: "When impact on users or metrics is uncertain", isCorrect: true },
              { label: "Only after deleting production data" },
              { label: "Before writing any code" },
            ],
          },
          {
            prompt: "What is a regression in ML ops terms?",
            explanation:
              "A change that worsens measured quality compared to a baseline—caught by automated eval pipelines.",
            options: [
              { label: "A statistical model going backward in time" },
              { label: "A degradation in measured quality after a change", isCorrect: true },
              { label: "A type of SQL join" },
              { label: "A successful deploy" },
            ],
          },
        ],
      },
      {
        slug: "safety-guardrails",
        title: "Safety & Guardrails",
        description: "Prompt injection, PII, and policy enforcement.",
        questions: [
          {
            prompt: "What is prompt injection?",
            explanation:
              "Untrusted input tries to override system instructions (e.g. 'ignore previous rules'). Treat user content as hostile.",
            options: [
              { label: "A database injection in SQL" },
              { label: "Malicious instructions embedded in user-controlled input", isCorrect: true },
              { label: "Installing npm packages" },
              { label: "Using HTTPS" },
            ],
          },
          {
            prompt: "Why avoid sending raw PII to third-party LLM APIs when unnecessary?",
            explanation:
              "Data may be logged, retained, or used per provider policy. Minimize and redact sensitive fields.",
            options: [
              { label: "PII improves model accuracy always" },
              { label: "To reduce privacy risk and compliance exposure", isCorrect: true },
              { label: "PII is required for JSON mode" },
              { label: "PII prevents hallucination" },
            ],
          },
          {
            prompt: "What is an output guardrail?",
            explanation:
              "Post-generation checks block or rewrite policy violations (toxicity, secrets, format violations).",
            options: [
              { label: "A firewall rule for port 443 only" },
              { label: "Validation or filtering applied to model outputs", isCorrect: true },
              { label: "A CSS stylesheet" },
              { label: "A Prisma migration" },
            ],
          },
          {
            prompt: "What is a defense-in-depth approach to AI safety?",
            explanation:
              "Combine system prompts, input sanitization, tool permissions, output filters, and human review for high-risk flows.",
            options: [
              { label: "Rely on a single long system prompt" },
              { label: "Layer multiple controls across the stack", isCorrect: true },
              { label: "Disable all logging" },
              { label: "Trust the model implicitly" },
            ],
          },
          {
            prompt: "Why scope tools/APIs available to an agent narrowly?",
            explanation:
              "Least privilege limits blast radius if the model is tricked into harmful actions.",
            options: [
              { label: "To make injection easier" },
              { label: "To limit damage if the model is misled", isCorrect: true },
              { label: "Tools are never used in production" },
              { label: "Wider scope always improves safety" },
            ],
          },
        ],
      },
    ],
  },
];

function assertFiveQuestions(quiz: SeedQuiz): void {
  if (quiz.questions.length !== 5) {
    throw new Error(`Quiz "${quiz.slug}" must have exactly 5 questions`);
  }
  for (const q of quiz.questions) {
    if (q.options.length !== 4) {
      throw new Error(`Question in "${quiz.slug}" must have 4 options`);
    }
    const correct = q.options.filter((o) => o.isCorrect);
    if (correct.length !== 1) {
      throw new Error(`Question in "${quiz.slug}" must have exactly one correct option`);
    }
  }
}

async function main(): Promise<void> {
  for (const cat of catalog) {
    for (const quiz of cat.quizzes) {
      assertFiveQuestions(quiz);
    }
  }

  await prisma.attemptAnswer.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.category.deleteMany();

  for (const [catIndex, cat] of catalog.entries()) {
    const category = await prisma.category.create({
      data: {
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        sortOrder: catIndex + 1,
      },
    });

    for (const [quizIndex, quiz] of cat.quizzes.entries()) {
      await prisma.quiz.create({
        data: {
          categoryId: category.id,
          slug: quiz.slug,
          title: quiz.title,
          description: quiz.description,
          sortOrder: quizIndex + 1,
          questions: {
            create: quiz.questions.map((q, qIndex) => ({
              prompt: q.prompt,
              explanation: q.explanation,
              sortOrder: qIndex + 1,
              options: {
                create: q.options.map((o, oIndex) => ({
                  label: o.label,
                  sortOrder: oIndex + 1,
                  isCorrect: Boolean(o.isCorrect),
                })),
              },
            })),
          },
        },
      });
    }
  }

  const counts = await prisma.category.count();
  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.question.count();
  console.log(
    `Seed complete: ${counts} categories, ${quizCount} quizzes, ${questionCount} questions.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
