import OpenAI from "openai";
import { buildAiContext } from "@/lib/data/sales-store";
import type { SalesFilters } from "@/lib/types";

function getClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });
}

function contextToPrompt(context: ReturnType<typeof buildAiContext>): string {
  return JSON.stringify(context, null, 2);
}

const PLAIN_TEXT_RULE =
  "Respond in plain text only. Do not use markdown, bold, asterisks, bullet lists, or other formatting.";

function toPlainText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

export async function generateAutoSummary(filters: SalesFilters): Promise<string> {
  const context = buildAiContext(filters);
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          `You are a sales analytics assistant. Write 1-2 concise sentences summarizing the most important insight from the data. Mention specific months, regions, sales reps, and dollar amounts when relevant. The context includes topSalesReps with each rep's totalSales, units, and orders. Example: 'In February, the East region outperformed others with $45,230 in sales, led by Patrick Valdez with $19,599.' Use USD formatting. Only use facts from the provided context. ${PLAIN_TEXT_RULE}`,
      },
      {
        role: "user",
        content: `Summarize this sales data:\n${contextToPrompt(context)}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "Unable to generate summary.";
  return toPlainText(raw);
}

export async function answerCustomQuestion(
  filters: SalesFilters,
  question: string,
): Promise<string> {
  const context = buildAiContext(filters);
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          `You are a sales analytics assistant. Answer questions using only the provided aggregated sales context. The context includes topSalesReps (salesRep name, totalSales, units, orders), regional totals, categories, products, and monthly trends. For questions about best salespeople or sales reps, use topSalesReps and bestSalesRep. Be concise and cite specific names and numbers. If the data truly cannot answer the question, say so. ${PLAIN_TEXT_RULE}`,
      },
      {
        role: "user",
        content: `Context:\n${contextToPrompt(context)}\n\nQuestion: ${question}`,
      },
    ],
    max_tokens: 400,
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "Unable to answer question.";
  return toPlainText(raw);
}
