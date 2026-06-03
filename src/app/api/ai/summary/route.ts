import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { parseFiltersFromBody } from "@/lib/api/parse-filters";
import { generateAutoSummary } from "@/lib/ai/deepseek";

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const filters = parseFiltersFromBody(body);
    const summary = await generateAutoSummary(filters);
    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
