import React, { useEffect, useState } from "react";
import { Package, Factory, Receipt, Wallet, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { DashboardSummary } from "../types";
import { useAuth } from "../context/AuthContext";

const StatCard: React.FC<{
  label: string;
  icon: React.ElementType;
  tint: string;
  children: React.ReactNode;
}> = ({ label, icon: Icon, tint, children }) => (
  <div className="card-hoverable p-4 sm:p-5">
    <div className={`icon-tile mb-3 ${tint}`}>
      <Icon size={18} strokeWidth={2} />
    </div>
    <div className="text-[11px] sm:text-[12px] font-medium text-ink-400">{label}</div>
    <div className="mt-1">{children}</div>
  </div>
);

const stockStatus = (stock: number, minimum: number, t: (k: string) => string) => {
  if (stock <= 0) return { label: t("dashboard.stock.out"), tone: "bg-clay-50 text-clay-600" };
  if (stock <= minimum) return { label: t("dashboard.stock.low"), tone: "bg-gold-50 text-gold-600" };
  return { label: t("dashboard.stock.ok"), tone: "bg-sprout-100 text-sprout-700" };
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardSummary>("/reports/dashboard");
      setData(res.data);
    } catch (e) {
      setError(t("dashboard.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card-soft p-5 h-28 skeleton" />
        ))}
      </div>
    );
  }
  if (error) return <div className="text-sm text-clay-500 bg-clay-50 rounded-xl px-4 py-3 inline-block">{error}</div>;
  if (!data) return null;

  const producedByUnit = data.today_produced_by_unit?.length
    ? data.today_produced_by_unit
    : [{ unit: "", quantity: data.today_produced }];

  const lowStock = data.low_stock_products.filter((p) => p.stock <= p.minimum_stock);

  return (
    <div>
      <div className="mb-6 sm:mb-7 animate-fade-up flex items-center gap-1.5">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
          {t("dashboard.greeting", { name: user?.full_name })}
        </h1>
      </div>
      <p className="text-sm text-ink-400 -mt-5 sm:-mt-6 mb-6">{t("dashboard.subtitle")}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 stagger">
        <StatCard label={t("dashboard.activeProducts")} icon={Package} tint="bg-sprout-50 text-sprout-600">
          <div className="font-display text-xl sm:text-2xl font-bold text-ink-900">{data.total_products}</div>
        </StatCard>

        <StatCard label={t("dashboard.producedToday")} icon={Factory} tint="bg-sprout-50 text-sprout-600">
          <div className="space-y-0.5">
            {producedByUnit.map((row, idx) => (
              <div key={idx} className="font-display text-base sm:text-lg font-bold text-ink-900">
                {row.quantity.toLocaleString()} {row.unit}
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard label={t("dashboard.soldToday")} icon={Receipt} tint="bg-gold-50 text-gold-600">
          <div className="font-display text-xl sm:text-2xl font-bold text-ink-900">{data.today_sold.toLocaleString()}</div>
        </StatCard>

        <StatCard label={t("dashboard.revenueToday")} icon={Wallet} tint="bg-plum-50 text-plum-500">
          <div className="font-display text-lg sm:text-2xl font-bold text-ink-900">
            {data.today_revenue.toLocaleString()} {t("dashboard.sum")}
          </div>
        </StatCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-soft p-5 animate-fade-up">
          <h2 className="font-display font-semibold text-ink-900 mb-3">{t("dashboard.recentOperations")}</h2>
          <div className="divide-y divide-ink-50">
            {(data.recent_operations || []).slice(0, 8).map((op, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2.5 text-sm">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150 ${
                    op.type === "production" ? "bg-sprout-50 text-sprout-600" : "bg-gold-50 text-gold-600"
                  }`}
                >
                  {op.type === "production" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-ink-700 font-medium truncate">{op.product_name}</div>
                  <div className="text-[12px] text-ink-400">
                    {op.time} · {op.user_name}
                  </div>
                </div>
                <div className={`font-display font-semibold shrink-0 ${op.type === "production" ? "text-sprout-600" : "text-gold-600"}`}>
                  {op.type === "production" ? "+" : "-"}
                  {op.quantity} {op.unit}
                </div>
              </div>
            ))}
            {(!data.recent_operations || data.recent_operations.length === 0) && (
              <div className="text-sm text-ink-400 py-4">{t("dashboard.noOperations")}</div>
            )}
          </div>
        </div>

        <div className="card-soft p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-ink-900">{t("dashboard.lowStock")}</h2>
            <span className="pill-tag bg-cream-100 text-ink-500">{lowStock.length}</span>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => {
              const status = stockStatus(p.stock, p.minimum_stock, t);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm px-3.5 py-2.5 rounded-xl bg-cream-50 transition-all duration-150 hover:bg-sprout-50 hover:translate-x-1"
                >
                  <span className="text-ink-700 font-medium truncate pr-2">{p.name}</span>
                  <span className={`pill-tag shrink-0 ${status.tone}`}>
                    {p.stock.toLocaleString()} {p.unit} · {status.label}
                  </span>
                </div>
              );
            })}
            {lowStock.length === 0 && (
              <div className="text-sm text-ink-400 py-2">{t("dashboard.allSufficient")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;