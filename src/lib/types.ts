export type Region = "North" | "South" | "East" | "West";

export interface SaleRecord {
  orderId: number;
  date: Date;
  region: Region;
  product: string;
  category: string;
  salesAmount: number;
  unitsSold: number;
  salesRep: string;
}

export interface SalesFilters {
  region?: string;
  startDate?: string;
  endDate?: string;
}

export interface KpiData {
  totalSales: number;
  totalUnits: number;
  bestRegion: string;
  bestRegionSales: number;
}

export interface RegionSales {
  region: string;
  total: number;
}

export interface CategorySales {
  category: string;
  total: number;
}

export interface TopProduct {
  product: string;
  totalSales: number;
  units: number;
}

export interface TopSalesRep {
  salesRep: string;
  totalSales: number;
  units: number;
  orders: number;
}

export interface AvailableMonth {
  value: string;
  label: string;
}

export interface DataMeta {
  availableMonths: AvailableMonth[];
  minDate: string;
  maxDate: string;
}

export interface MonthlyTrend {
  month: string;
  total: number;
}

export interface PaginatedSales {
  rows: SaleRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SaleRowDto {
  orderId: number;
  date: string;
  region: string;
  product: string;
  category: string;
  salesAmount: number;
  unitsSold: number;
  salesRep: string;
}
