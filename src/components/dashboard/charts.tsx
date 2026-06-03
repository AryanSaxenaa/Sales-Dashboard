"use client";

import { Armchair, Cpu, type LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CategorySales,
  MonthlyTrend,
  RegionSales,
} from "@/lib/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const TREND_COLOR = "#059669";
const BAR_HEIGHT = 200;
const LINE_HEIGHT = 220;

function formatMonthTick(value: string) {
  const month = value.split("-")[1];
  const labels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return labels[Number(month) - 1] ?? value;
}

interface SegmentStyle {
  color: string;
  glow: string;
  Icon: LucideIcon;
}

const REGION_COLORS: Record<string, string> = {
  North: "#2563eb",
  South: "#059669",
  East: "#7c3aed",
  West: "#d97706",
};

const CATEGORY_STYLE: Record<string, SegmentStyle> = {
  Electronics: { color: "#6366f1", glow: "#818cf8", Icon: Cpu },
  Furniture: { color: "#f59e0b", glow: "#fbbf24", Icon: Armchair },
};

const FALLBACK_STYLE: SegmentStyle = {
  color: "#64748b",
  glow: "#94a3b8",
  Icon: Cpu,
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLE[category] ?? FALLBACK_STYLE;
}

function getRegionColor(region: string) {
  return REGION_COLORS[region] ?? FALLBACK_STYLE.color;
}

interface ChartsProps {
  byRegion?: RegionSales[];
  byCategory?: CategorySales[];
  trends?: MonthlyTrend[];
  loading: boolean;
}

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return <Skeleton className="w-full" style={{ height }} />;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-background/95 px-3 py-2 backdrop-blur-sm">
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <p className="text-sm font-semibold">
        {formatCurrency(Number(payload[0].value))}
      </p>
    </div>
  );
}

function SegmentTooltip({
  active,
  payload,
  getStyle,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  getStyle: (label: string) => SegmentStyle;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const style = getStyle(item.name);

  return (
    <div className="rounded-md border border-border bg-background/95 px-3 py-2 backdrop-blur-sm">
      <p className="text-xs font-medium text-muted-foreground">{item.name}</p>
      <p className="text-sm font-semibold" style={{ color: style.color }}>
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

function SegmentBreakdown<T extends { total: number }>({
  data,
  labelKey,
  getStyle,
}: {
  data: T[];
  labelKey: keyof T & string;
  getStyle: (label: string) => SegmentStyle;
}) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col justify-center gap-2">
      {data.map((item) => {
        const label = String(item[labelKey]);
        const style = getStyle(label);
        const { Icon } = style;
        const share = total > 0 ? (item.total / total) * 100 : 0;

        return (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${style.color}18`,
                    color: style.color,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium leading-none">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {share.toFixed(1)}%
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-xs font-semibold tabular-nums">
                {formatCurrency(item.total)}
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${share}%`,
                  background: `linear-gradient(90deg, ${style.color}, ${style.glow})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChartSection<T extends { total: number }>({
  data,
  labelKey,
  getStyle,
}: {
  data: T[];
  labelKey: keyof T & string;
  getStyle: (label: string) => SegmentStyle;
}) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-square w-full max-w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey={labelKey}
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((item) => (
                <Cell
                  key={String(item[labelKey])}
                  fill={getStyle(String(item[labelKey])).color}
                />
              ))}
            </Pie>
            <Tooltip content={<SegmentTooltip getStyle={getStyle} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex w-[46%] min-w-0 flex-col items-center text-center">
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Total
            </span>
            <span
              className="mt-1 max-w-full truncate text-sm font-bold tabular-nums leading-tight"
              title={formatCurrency(total)}
            >
              {formatCompactCurrency(total)}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full">
        <SegmentBreakdown data={data} labelKey={labelKey} getStyle={getStyle} />
      </div>
    </div>
  );
}

export function DashboardCharts({
  byRegion,
  byCategory,
  trends,
  loading,
}: ChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DashboardPanel title="Sales by Region">
        {loading || !byRegion ? (
          <ChartSkeleton height={BAR_HEIGHT} />
        ) : (
          <ResponsiveContainer width="100%" height={BAR_HEIGHT}>
            <BarChart data={byRegion} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="region"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {byRegion.map((item) => (
                  <Cell key={item.region} fill={getRegionColor(item.region)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </DashboardPanel>

      <DashboardPanel title="Sales by Category">
        {loading || !byCategory ? (
          <ChartSkeleton height={BAR_HEIGHT} />
        ) : (
          <DonutChartSection
            data={byCategory}
            labelKey="category"
            getStyle={getCategoryStyle}
          />
        )}
      </DashboardPanel>

      <DashboardPanel title="Monthly Sales Trend">
        {loading || !trends ? (
          <ChartSkeleton height={LINE_HEIGHT} />
        ) : (
          <ResponsiveContainer width="100%" height={LINE_HEIGHT}>
            <LineChart
              data={trends}
              margin={{ top: 12, right: 24, left: 4, bottom: 8 }}
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickFormatter={formatMonthTick}
                interval={0}
                minTickGap={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={TREND_COLOR}
                strokeWidth={2.5}
                dot={{ r: 3, fill: TREND_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </DashboardPanel>
    </div>
  );
}
