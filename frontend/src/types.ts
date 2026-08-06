export type Role = "admin" | "employee";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  unit: string;
  description?: string | null;
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

export interface DashboardSummary {
  total_products: number;
  today_produced: number;
  today_sold: number;
  today_revenue: number;
  total_stock: number;
  low_stock_products: Product[];
}

export interface ReportRow {
  period: string;
  product_id: number;
  product_name: string;
  produced: number;
  sold: number;
  revenue: number;
}
