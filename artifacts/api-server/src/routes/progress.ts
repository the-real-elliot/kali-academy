import { Router } from "express";
import { db } from "@workspace/db";
import { progressTable } from "@workspace/db";

const router = Router();

router.get("/progress", async (req, res) => {
  const progress = await db.select().from(progressTable);
  res.json(progress);
});

router.post("/progress", async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) {
    res.status(400).json({ error: "lessonId required" });
    return;
  }

  const result = await db.insert(progressTable).values({ lessonId }).returning();
  res.json(result[0]);
});

export default router;
