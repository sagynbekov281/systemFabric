export type Role = "admin" | "employee";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface ReturnRecord {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  customer?: string | null;
  record_date: string;
  note?: string | null;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  unit: string;
  description?: string | null;
  price?: number | null;
  minimum_stock: number;
  is_active: boolean;
  created_at: string;
  stock: number;
}

export interface ProductionRecord {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  record_date: string;
  note?: string | null;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface SaleRecord {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price?: number | null;
  customer?: string | null;
  record_date: string;
  note?: string | null;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

// One row per unit, since litres/kg/pieces can't be summed into one figure
// (see Dashboard: "Бүгүн өндүрүлдү").
export interface UnitQuantity {
  unit: string;
  quantity: number;
}

// A single production or sale event, for the Dashboard's "Акыркы операциялар" feed.
export interface RecentOperation {
  time: string;
  product_name: string;
  quantity: number;
  unit: string;
  type: "production" | "sale";
  user_name: string;
}

export interface DashboardSummary {
  total_products: number;
  today_produced: number;
  today_produced_by_unit: UnitQuantity[];
  today_sold: number;
  today_revenue: number;
  total_stock: number;
  low_stock_products: Product[];
  recent_operations: RecentOperation[];
}

export interface ReportRow {
  period: string;
  product_id: number;
  product_name: string;
  produced: number;
  sold: number;
  returned: number;
  revenue: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}