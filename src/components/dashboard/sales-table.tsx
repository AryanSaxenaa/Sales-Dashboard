"use client";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SaleRowDto } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface SalesTableProps {
  rows?: SaleRowDto[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function SalesTable({
  rows,
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}: SalesTableProps) {
  return (
    <DashboardPanel
      title="Sales Data"
      action={
        <p className="text-sm text-muted-foreground">{formatNumber(total)} records</p>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border/80 text-left text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Order ID</th>
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Region</th>
              <th className="pb-3 pr-4 font-medium">Product</th>
              <th className="pb-3 pr-4 font-medium">Category</th>
              <th className="pb-3 pr-4 font-medium">Sales</th>
              <th className="pb-3 pr-4 font-medium">Units</th>
              <th className="pb-3 font-medium">Sales Rep</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="py-3">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : rows && rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.orderId} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4">{row.orderId}</td>
                  <td className="py-3 pr-4">{row.date}</td>
                  <td className="py-3 pr-4">{row.region}</td>
                  <td className="py-3 pr-4">{row.product}</td>
                  <td className="py-3 pr-4">{row.category}</td>
                  <td className="py-3 pr-4">{formatCurrency(row.salesAmount)}</td>
                  <td className="py-3 pr-4">{row.unitsSold}</td>
                  <td className="py-3">{row.salesRep}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardPanel>
  );
}
