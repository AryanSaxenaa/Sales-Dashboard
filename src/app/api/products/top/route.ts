import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { parseFiltersFromSearchParams } from "@/lib/api/parse-filters";
import { getTopProducts } from "@/lib/data/sales-store";

export async function GET(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const filters = parseFiltersFromSearchParams(searchParams);
  const limit = Number(searchParams.get("limit") ?? "5");
  return NextResponse.json(getTopProducts(filters, limit));
}
