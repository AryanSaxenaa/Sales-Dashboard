import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { parseFiltersFromBody } from "@/lib/api/parse-filters";
import { answerCustomQuestion } from "@/lib/ai/deepseek";

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const filters = parseFiltersFromBody(body);
    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 },
      );
    }

    const answer = await answerCustomQuestion(filters, question);
    return NextResponse.json({ answer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to answer question";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
