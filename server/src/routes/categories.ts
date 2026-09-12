import { Router } from "express";
import { listCategories } from "../services/catalogService";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const data = await listCategories();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
