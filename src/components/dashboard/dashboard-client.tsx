"use client";

import { useEffect, useMemo, useState } from "react";
import { AiPanel } from "@/components/dashboard/ai-panel";
import { DashboardCharts } from "@/components/dashboard/charts";
import {
  DashboardFilters,
  type DashboardFilterState,
} from "@/components/dashboard/filters";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { SalesTable } from "@/components/dashboard/sales-table";
import { filtersToQueryString, monthToDateRange } from "@/lib/api/parse-filters";
import type {
  AvailableMonth,
  CategorySales,
  KpiData,
  MonthlyTrend,
  RegionSales,
  SaleRowDto,
  SalesFilters,
} from "@/lib/types";

export function DashboardClient() {
  const [filters, setFilters] = useState<DashboardFilterState>({
    region: "all",
  });
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState<KpiData>();
  const [byRegion, setByRegion] = useState<RegionSales[]>();
  const [byCategory, setByCategory] = useState<CategorySales[]>();
  const [trends, setTrends] = useState<MonthlyTrend[]>();
  const [rows, setRows] = useState<SaleRowDto[]>();
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const apiFilters: SalesFilters = useMemo(() => {
    const monthFilters = monthToDateRange(filters.startMonth, filters.endMonth);
    return {
      ...(filters.region !== "all" ? { region: filters.region } : {}),
      ...monthFilters,
    };
  }, [filters]);

  const query = filtersToQueryString(apiFilters);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/meta", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          setAvailableMonths(data.availableMonths ?? []);
        }
      } catch {
        // Meta is optional for rendering; filters fall back to empty month list
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setError("");
      try {
        const [kpiRes, regionRes, categoryRes, trendsRes, salesRes] =
          await Promise.all([
            fetch(`/api/kpis?${query}`, { credentials: "same-origin" }),
            fetch(`/api/sales/by-region?${query}`, { credentials: "same-origin" }),
            fetch(`/api/sales/by-category?${query}`, { credentials: "same-origin" }),
            fetch(`/api/sales/trends?${query}`, { credentials: "same-origin" }),
            fetch(`/api/sales?${query}&page=${page}&limit=25`, {
              credentials: "same-origin",
            }),
          ]);

        if (
          !kpiRes.ok ||
          !regionRes.ok ||
          !categoryRes.ok ||
          !trendsRes.ok ||
          !salesRes.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        const [kpiData, regionData, categoryData, trendsData, salesData] =
          await Promise.all([
            kpiRes.json(),
            regionRes.json(),
            categoryRes.json(),
            trendsRes.json(),
            salesRes.json(),
          ]);

        if (cancelled) return;

        setKpis(kpiData);
        setByRegion(regionData);
        setByCategory(categoryData);
        setTrends(trendsData);
        setRows(salesData.rows);
        setTotal(salesData.total);
        setTotalPages(salesData.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, page]);

  function handleFilterChange(next: DashboardFilterState) {
    setLoading(true);
    setFilters(next);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <DashboardFilters
        filters={filters}
        availableMonths={availableMonths}
        onChange={handleFilterChange}
      />
      <KpiCards data={kpis} loading={loading} />
      <DashboardCharts
        byRegion={byRegion}
        byCategory={byCategory}
        trends={trends}
        loading={loading}
      />
      <AiPanel filters={apiFilters} />
      <SalesTable
        rows={rows}
        page={page}
        totalPages={totalPages}
        total={total}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
