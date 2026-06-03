import { format } from "date-fns";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { parseFiltersFromSearchParams } from "@/lib/api/parse-filters";
import { getPaginatedRecords } from "@/lib/data/sales-store";

export async function GET(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const filters = parseFiltersFromSearchParams(searchParams);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "25");

  const result = getPaginatedRecords(filters, page, limit);

  return NextResponse.json({
    ...result,
    rows: result.rows.map((row) => ({
      orderId: row.orderId,
      date: format(row.date, "dd-MM-yyyy"),
      region: row.region,
      product: row.product,
      category: row.category,
      salesAmount: row.salesAmount,
      unitsSold: row.unitsSold,
      salesRep: row.salesRep,
    })),
  });
}
