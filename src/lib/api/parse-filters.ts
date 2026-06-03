import { endOfMonth, format, parse } from "date-fns";
import type { SalesFilters } from "@/lib/types";

export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): SalesFilters {
  const region = params.get("region");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");

  return {
    ...(region && region !== "all" ? { region } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };
}

export function parseFiltersFromBody(body: unknown): SalesFilters {
  if (!body || typeof body !== "object") return {};
  const data = body as Record<string, unknown>;

  return {
    ...(typeof data.region === "string" && data.region !== "all"
      ? { region: data.region }
      : {}),
    ...(typeof data.startDate === "string" ? { startDate: data.startDate } : {}),
    ...(typeof data.endDate === "string" ? { endDate: data.endDate } : {}),
  };
}

export function filtersToQueryString(filters: SalesFilters): string {
  const params = new URLSearchParams();
  if (filters.region) params.set("region", filters.region);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  return params.toString();
}

export function monthToDateRange(
  startMonth?: string,
  endMonth?: string,
): SalesFilters {
  const filters: SalesFilters = {};

  if (startMonth) {
    filters.startDate = `${startMonth}-01`;
  }

  if (endMonth) {
    const end = endOfMonth(parse(`${endMonth}-01`, "yyyy-MM-dd", new Date()));
    filters.endDate = format(end, "yyyy-MM-dd");
  }

  return filters;
}
