import { MemorySession, OpenAIConversationsSession, run } from "@openai/agents";
import { triageAgent } from "../agents/triageAgent";
import { prisma } from "../database/client";
import type { AdaptLearnContext } from "../types";

/**
 * SESSION SERVICE
 * 
 * Bu service, AdaptLearn'ın session management'ini handle eder:
 * 1. User session'ı oluştur/load et
 * 2. OpenAI Sessions API ile conversation history persist et
 * 3. Agent'ları çalıştır (run fonksiyonu)
 * 4. Response'u user'a döndür
 * 
 * Two-layer session management:
 * - Database (PostgreSQL): Persistent storage
 * - OpenAI Sessions API: Conversation memory
 */

/**
 * Kullanıcı için session oluştur veya load et
 */
export async function getOrCreateUserSession(
  userId: string,
  topic: string
) {
  // Veritabanında user var mı?
  let user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: `user_${userId}@adaptlearn.local`, // Placeholder
      },
    });
  }

  // Belirtilen konuda açık session var mı?
  let session = await prisma.session.findFirst({
    where: {
      userId,
      topic,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Session yoksa yeni oluştur
  if (!session) {
    session = await prisma.session.create({
      data: {
        userId,
        topic,
      },
    });
  }

  return session;
}

/**
 * Triage Agent'ı kullanıcı mesajıyla çalıştır
 * OpenAI Sessions API kullanarak history persist et
 */
export async function runAgentWithSession(
  userMessage: string,
  userId: string,
  topic: string = "English Words" // Default topic
) {
  // Session'ı al/oluştur
  const dbSession = await getOrCreateUserSession(userId, topic);

  // OpenAI Conversations Session oluştur
  // (Gerçek uygulamada, database'de conversation ID'si de saklamak gerek)
  const conversationSession = new MemorySession({
    sessionId: dbSession.id,
  });

  // Context'i hazırla
  const context: AdaptLearnContext = {
    userId,
    sessionId: dbSession.id,
    topic,
    userLevel: dbSession.level as any,
  };

  try {
    // Agent'ı çalıştır
    const result = await run(triageAgent, userMessage, {
      context,
      session: conversationSession,
    });

    // Response'u log et
    if (result.finalOutput) {
      await prisma.sessionMessage.create({
        data: {
          sessionId: dbSession.id,
          role: "user",
          agent: "triage",
          content: userMessage,
        },
      });

      await prisma.sessionMessage.create({
        data: {
          sessionId: dbSession.id,
          role: "assistant",
          agent: "triage",
          content: result.finalOutput.toString(),
        },
      });
    }

    return {
      success: true,
      response: result.finalOutput?.toString() || "No response",
      sessionId: dbSession.id,
    };
  } catch (error) {
    console.error("Agent error:", error);
    return {
      success: false,
      error: (error as Error).message,
      sessionId: dbSession.id,
    };
  }
}

/**
 * Kullanıcının session history'sini al
 */
export async function getUserSessionHistory(sessionId: string) {
  const messages = await prisma.sessionMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

/**
 * User'ın tüm sessions'ını al
 */
export async function getUserSessions(userId: string) {
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return sessions;
}
