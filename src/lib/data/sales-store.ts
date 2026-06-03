import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { format, parse as parseDateFns, startOfDay, endOfDay } from "date-fns";
import type {
  AvailableMonth,
  CategorySales,
  DataMeta,
  KpiData,
  MonthlyTrend,
  PaginatedSales,
  Region,
  RegionSales,
  SaleRecord,
  SalesFilters,
  TopProduct,
  TopSalesRep,
} from "@/lib/types";

const REGIONS: Region[] = ["North", "South", "East", "West"];

let cachedRecords: SaleRecord[] | null = null;

function parseCsvDate(value: string): Date {
  return parseDateFns(value.trim(), "dd-MM-yyyy", new Date());
}

function loadRecords(): SaleRecord[] {
  if (cachedRecords) return cachedRecords;

  const csvPath = path.join(process.cwd(), "data", "DataSheet.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  cachedRecords = rows.map((row) => ({
    orderId: Number(row.OrderID),
    date: parseCsvDate(row.Date),
    region: row.Region as Region,
    product: row.Product,
    category: row.Category,
    salesAmount: Number(row.SalesAmount),
    unitsSold: Number(row.UnitsSold),
    salesRep: row.SalesRep,
  }));

  return cachedRecords;
}

function applyFilters(records: SaleRecord[], filters: SalesFilters): SaleRecord[] {
  let filtered = records;

  if (filters.region && filters.region !== "all") {
    filtered = filtered.filter((r) => r.region === filters.region);
  }

  if (filters.startDate) {
    const start = startOfDay(new Date(filters.startDate));
    filtered = filtered.filter((r) => r.date >= start);
  }

  if (filters.endDate) {
    const end = endOfDay(new Date(filters.endDate));
    filtered = filtered.filter((r) => r.date <= end);
  }

  return filtered;
}

export function getFilteredRecords(filters: SalesFilters = {}): SaleRecord[] {
  return applyFilters(loadRecords(), filters);
}

export function getKpis(filters: SalesFilters = {}): KpiData {
  const records = getFilteredRecords(filters);
  const totalSales = records.reduce((sum, r) => sum + r.salesAmount, 0);
  const totalUnits = records.reduce((sum, r) => sum + r.unitsSold, 0);

  const regionTotals = new Map<string, number>();
  for (const region of REGIONS) {
    regionTotals.set(region, 0);
  }
  for (const record of records) {
    regionTotals.set(
      record.region,
      (regionTotals.get(record.region) ?? 0) + record.salesAmount,
    );
  }

  let bestRegion = "N/A";
  let bestRegionSales = 0;
  for (const [region, total] of regionTotals) {
    if (total > bestRegionSales) {
      bestRegion = region;
      bestRegionSales = total;
    }
  }

  return { totalSales, totalUnits, bestRegion, bestRegionSales };
}

export function getSalesByRegion(filters: SalesFilters = {}): RegionSales[] {
  const records = getFilteredRecords(filters);
  const totals = new Map<string, number>();

  for (const region of REGIONS) {
    totals.set(region, 0);
  }

  for (const record of records) {
    totals.set(record.region, (totals.get(record.region) ?? 0) + record.salesAmount);
  }

  return REGIONS.map((region) => ({
    region,
    total: totals.get(region) ?? 0,
  }));
}

export function getSalesByCategory(filters: SalesFilters = {}): CategorySales[] {
  const records = getFilteredRecords(filters);
  const totals = new Map<string, number>();

  for (const record of records) {
    totals.set(
      record.category,
      (totals.get(record.category) ?? 0) + record.salesAmount,
    );
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function getTopProducts(
  filters: SalesFilters = {},
  limit = 5,
): TopProduct[] {
  const records = getFilteredRecords(filters);
  const totals = new Map<string, { totalSales: number; units: number }>();

  for (const record of records) {
    const existing = totals.get(record.product) ?? { totalSales: 0, units: 0 };
    totals.set(record.product, {
      totalSales: existing.totalSales + record.salesAmount,
      units: existing.units + record.unitsSold,
    });
  }

  return Array.from(totals.entries())
    .map(([product, data]) => ({
      product,
      totalSales: data.totalSales,
      units: data.units,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
}

export function getTopSalesReps(
  filters: SalesFilters = {},
  limit = 10,
): TopSalesRep[] {
  const records = getFilteredRecords(filters);
  const totals = new Map<
    string,
    { totalSales: number; units: number; orders: number }
  >();

  for (const record of records) {
    const existing = totals.get(record.salesRep) ?? {
      totalSales: 0,
      units: 0,
      orders: 0,
    };
    totals.set(record.salesRep, {
      totalSales: existing.totalSales + record.salesAmount,
      units: existing.units + record.unitsSold,
      orders: existing.orders + 1,
    });
  }

  return Array.from(totals.entries())
    .map(([salesRep, data]) => ({ salesRep, ...data }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
}

export function getAvailableMonths(): AvailableMonth[] {
  const records = loadRecords();
  const months = new Set<string>();

  for (const record of records) {
    months.add(format(record.date, "yyyy-MM"));
  }

  return Array.from(months)
    .sort()
    .map((value) => ({
      value,
      label: format(parseDateFns(`${value}-01`, "yyyy-MM-dd", new Date()), "MMMM yyyy"),
    }));
}

export function getDataMeta(): DataMeta {
  const records = loadRecords();
  const dates = records.map((r) => r.date.getTime());
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));

  return {
    availableMonths: getAvailableMonths(),
    minDate: format(min, "yyyy-MM-dd"),
    maxDate: format(max, "yyyy-MM-dd"),
  };
}

export function getMonthlyTrends(filters: SalesFilters = {}): MonthlyTrend[] {
  const records = getFilteredRecords(filters);
  const totals = new Map<string, number>();

  for (const record of records) {
    const month = format(record.date, "yyyy-MM");
    totals.set(month, (totals.get(month) ?? 0) + record.salesAmount);
  }

  return Array.from(totals.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getPaginatedRecords(
  filters: SalesFilters = {},
  page = 1,
  limit = 25,
): PaginatedSales {
  const records = getFilteredRecords(filters).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    rows: records.slice(start, start + limit),
    total,
    page: safePage,
    totalPages,
  };
}

export function buildAiContext(filters: SalesFilters = {}) {
  const kpis = getKpis(filters);
  const byRegion = getSalesByRegion(filters);
  const byCategory = getSalesByCategory(filters);
  const topProducts = getTopProducts(filters, 5);
  const topSalesReps = getTopSalesReps(filters, 10);
  const monthlyTrends = getMonthlyTrends(filters);

  const bestMonth = monthlyTrends.reduce(
    (best, current) => (current.total > best.total ? current : best),
    { month: "N/A", total: 0 },
  );

  const bestSalesRep = topSalesReps[0] ?? null;

  return {
    filters,
    kpis,
    salesByRegion: byRegion,
    salesByCategory: byCategory,
    topProducts,
    topSalesReps,
    bestSalesRep,
    monthlyTrends,
    bestMonth,
    recordCount: getFilteredRecords(filters).length,
  };
}
