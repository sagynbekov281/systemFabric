import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { Product, PaginatedResponse } from "../types";

const stockStatus = (stock: number, minimum: number, t: (k: string) => string) => {
  if (stock <= 0) return { label: t("dashboard.stock.out"), tone: "bg-clay-50 text-clay-600" };
  if (stock <= minimum) return { label: t("dashboard.stock.low"), tone: "bg-gold-50 text-gold-600" };
  return { label: t("dashboard.stock.ok"), tone: "bg-sprout-100 text-sprout-700" };
};

const Warehouse: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<Product>>("/products/", {
      params: { active_only: true, page: 1, page_size: 200 },
    });
    setProducts(res.data.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">{t("warehouse.title")}</h1>
        <p className="text-sm text-ink-400 mt-1">{t("warehouse.subtitle")}</p>
      </div>

      {!loading && (
        <div className="card-soft p-4 mb-6 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400">{t("warehouse.totalStock")}</div>
          <div className="font-mono text-xl font-bold text-sprout-600 mt-1 tabular-nums">{totalStock.toLocaleString()}</div>
        </div>
      )}

      {loading ? (
        <div className="card-soft p-5 text-sm text-ink-400 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {t("warehouse.loading")}
        </div>
      ) : products.length === 0 ? (
        <div className="card-soft px-6 py-10 text-center text-ink-400">{t("warehouse.noProducts")}</div>
      ) : (
        <>
          {/* ---------- Mobile: card list ---------- */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => {
              const status = stockStatus(p.stock, p.minimum_stock, t);
              return (
                <div key={p.id} className="card-soft p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                    <div className="text-xs text-ink-400 mt-0.5">{p.unit}</div>
                  </div>
                  <span className={`pill-tag shrink-0 ${status.tone}`}>
                    {p.stock.toLocaleString()} · {status.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ---------- Tablet / desktop: table ---------- */}
          <div className="hidden sm:block card-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-50">
                    <th className="table-head-cell sticky left-0 bg-cream-50 z-10">{t("warehouse.table.name")}</th>
                    <th className="table-head-cell">{t("warehouse.table.unit")}</th>
                    <th className="table-head-cell">{t("warehouse.table.stock")}</th>
                    <th className="table-head-cell">{t("warehouse.table.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const status = stockStatus(p.stock, p.minimum_stock, t);
                    return (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell font-medium text-ink-700 sticky left-0 bg-white z-10">{p.name}</td>
                        <td className="table-cell text-ink-500">{p.unit}</td>
                        <td className="table-cell">
                          <span className={`pill-tag ${status.tone}`}>{p.stock.toLocaleString()}</span>
                        </td>
                        <td className="table-cell">
                          <span className={`pill-tag ${status.tone}`}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Warehouse;