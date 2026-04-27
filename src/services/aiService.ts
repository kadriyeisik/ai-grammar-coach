import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const correctSentence = async (text: string) => {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are an English teacher.

Fix the sentence and explain the mistake.

Sentence: "${text}"

Return like:
Corrected:
Explanation:
    `,
  });

  return response.output_text;
};