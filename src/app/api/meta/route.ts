import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { getDataMeta } from "@/lib/data/sales-store";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  return NextResponse.json(getDataMeta());
}
