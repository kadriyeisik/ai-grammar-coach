import { Agent } from "@openai/agents";
import type { AdaptLearnContext } from "../types";

export const assessorAgent = new Agent<AdaptLearnContext>({
  name: "Assessor Agent",
  instructions: `You are an English level assessor.
Ask the user 3-5 short questions to determine their English level.
Based on their answers, classify them as: Beginner, Intermediate, or Advanced.
At the end, respond ONLY with this format:
LEVEL: Beginner | Intermediate | Advanced
REASON: (one sentence explanation)`,
});