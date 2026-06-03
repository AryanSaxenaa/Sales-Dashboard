"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import type { AvailableMonth } from "@/lib/types";

export interface DashboardFilterState {
  region: string;
  startMonth?: string;
  endMonth?: string;
}

interface FiltersProps {
  filters: DashboardFilterState;
  availableMonths: AvailableMonth[];
  onChange: (filters: DashboardFilterState) => void;
}

export function DashboardFilters({
  filters,
  availableMonths,
  onChange,
}: FiltersProps) {
  const endMonthOptions = filters.startMonth
    ? availableMonths.filter((m) => m.value >= filters.startMonth!)
    : availableMonths;

  const startMonthOptions = filters.endMonth
    ? availableMonths.filter((m) => m.value <= filters.endMonth!)
    : availableMonths;

  return (
    <DashboardPanel>
      <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.region}
        onValueChange={(region) => onChange({ ...filters, region })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          <SelectItem value="North">North</SelectItem>
          <SelectItem value="South">South</SelectItem>
          <SelectItem value="East">East</SelectItem>
          <SelectItem value="West">West</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.startMonth ?? "all"}
        onValueChange={(value) =>
          onChange({
            ...filters,
            startMonth: value === "all" ? undefined : value,
            endMonth:
              filters.endMonth && value !== "all" && filters.endMonth < value
                ? undefined
                : filters.endMonth,
          })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="From month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months (from)</SelectItem>
          {startMonthOptions.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.endMonth ?? "all"}
        onValueChange={(value) =>
          onChange({
            ...filters,
            endMonth: value === "all" ? undefined : value,
            startMonth:
              filters.startMonth && value !== "all" && filters.startMonth > value
                ? undefined
                : filters.startMonth,
          })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="To month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months (to)</SelectItem>
          {endMonthOptions.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() =>
          onChange({ region: "all", startMonth: undefined, endMonth: undefined })
        }
      >
        Clear filters
      </Button>
      </div>
    </DashboardPanel>
  );
}
