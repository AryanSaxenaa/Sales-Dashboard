import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { parseFiltersFromSearchParams } from "@/lib/api/parse-filters";
import { getSalesByCategory } from "@/lib/data/sales-store";

export async function GET(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const filters = parseFiltersFromSearchParams(searchParams);
  return NextResponse.json(getSalesByCategory(filters));
}
