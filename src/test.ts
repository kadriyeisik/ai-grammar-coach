import "./config";
import { runAgentWithSession, getUserSessionHistory } from "./services/sessionService";

async function main() {
  const userId = "test-user-001";
  const topic = "English Grammar";

  console.log("1. Mesaj gönderiliyor...");
  const result1 = await runAgentWithSession(
    "Hi! I want to improve my English.",
    userId,
    topic 
  );
  console.log("Agent yanıtı:", result1.response);
  console.log("Session ID:", result1.sessionId);

  console.log("\n2. İkinci mesaj gönderiliyor...");
  const result2 = await runAgentWithSession(
    "I goes to school every day.",
    userId,
    topic
  );
  console.log("Agent yanıtı:", result2.response);

  console.log("\n3. Session geçmişi alınıyor...");
  const history = await getUserSessionHistory(result1.sessionId!);
  console.log(`Toplam ${history.length} mesaj:`);
  history.forEach((msg) => {
    console.log(`  [${msg.role}] ${msg.content.slice(0, 80)}...`);
  });
}

main().catch(console.error);