import express from "express";
import { correctSentence } from "./services/aiService";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Grammar Coach API çalışıyor");
});

app.post("/correct", async (req, res) => {
  try {
    const { sentence } = req.body;

    if (!sentence) {
      return res.status(400).json({
        success: false,
        error: "sentence alanı zorunlu",
      });
    }

    const result = await correctSentence(sentence);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
  console.error("AI ERROR:", error);

  res.status(500).json({
    success: false,
    error: error.message || "AI error",
  });
}
});

export default app;