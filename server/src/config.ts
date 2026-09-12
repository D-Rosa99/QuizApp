import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 3001);

if (Number.isNaN(port)) {
  throw new Error("PORT must be a number");
}

export const config = {
  port,
  databaseUrl: process.env.DATABASE_URL,
};
