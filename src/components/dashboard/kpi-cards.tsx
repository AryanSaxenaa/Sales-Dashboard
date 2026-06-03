"use client";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { KpiData } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface KpiCardsProps {
  data?: KpiData;
  loading: boolean;
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  const items = [
    {
      title: "Total Sales",
      value: data ? formatCurrency(data.totalSales) : "—",
    },
    {
      title: "Total Units Sold",
      value: data ? formatNumber(data.totalUnits) : "—",
    },
    {
      title: "Best Performing Region",
      value: data
        ? `${data.bestRegion} (${formatCurrency(data.bestRegionSales)})`
        : "—",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <DashboardPanel key={item.title} title={item.title}>
          {loading ? (
            <Skeleton className="h-7 w-40" />
          ) : (
            <p className="text-xl font-bold tabular-nums">{item.value}</p>
          )}
        </DashboardPanel>
      ))}
    </div>
  );
}
