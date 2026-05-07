import express from "express";
import { prisma } from "./database/client";
import { correctSentence } from "./services/aiService";
import {
  runAgentWithSession,
  getUserSessionHistory,
  getUserSessions,
} from "./services/sessionService";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Grammar Coach API çalışıyor");
});

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: "ready" });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      status: "not_ready",
      error: error.message || "Database unavailable",
    });
  }
});

// Mevcut endpoint
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

    res.json({ success: true, result });
  } catch (error: any) {
    console.error("AI ERROR:", error);
    res.status(500).json({ success: false, error: error.message || "AI error" });
  }
});

// Kullanıcı mesajı gönder, agent çalıştır
app.post("/sessions/message", async (req, res) => {
  try {
    const { userId, message, topic } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: "userId ve message zorunlu",
      });
    }

    const result = await runAgentWithSession(message, userId, topic);

    res.json(result);
  } catch (error: any) {
    console.error("Session error:", error);
    res.status(500).json({ success: false, error: error.message || "Server error" });
  }
});

// Session mesaj geçmişi
app.get("/sessions/:sessionId/history", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await getUserSessionHistory(sessionId);
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kullanıcının tüm session'ları
app.get("/users/:userId/sessions", async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await getUserSessions(userId);
    res.json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;