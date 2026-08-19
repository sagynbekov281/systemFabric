import React, { useEffect, useState } from "react";
import { Package, Factory, Receipt, Wallet, ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { DashboardSummary, ReportRow } from "../types";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

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

const monthStartStr = () => {
  const d = new Date();
  d.setDate(1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};
const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const OperationRow: React.FC<{ op: DashboardSummary["recent_operations"][number] }> = ({ op }) => (
  <div className="flex items-center gap-3 py-2.5 text-sm">
    <div
      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
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
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [monthRows, setMonthRows] = useState<ReportRow[]>([]);
  const [monthLoading, setMonthLoading] = useState(true);

  const [opsModalOpen, setOpsModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);

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

  const loadMonth = async () => {
    setMonthLoading(true);
    try {
      const res = await api.get<ReportRow[]>("/reports/summary", {
        params: { date_from: monthStartStr(), date_to: todayStr(), group_by: "month" },
      });
      setMonthRows(res.data);
    } finally {
      setMonthLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadMonth();
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

  const allLowStock = data.low_stock_products;
  const lowStockPreview = allLowStock.slice(0, 5);
  const allOperations = data.recent_operations || [];
  const operationsPreview = allOperations.slice(0, 8);

  const monthProduced = monthRows.reduce((s, r) => s + r.produced, 0);
  const monthSold = monthRows.reduce((s, r) => s + r.sold, 0);
  const monthReturned = monthRows.reduce((s, r) => s + (r.returned || 0), 0);
  const monthRevenue = monthRows.reduce((s, r) => s + r.revenue, 0);

  const topProducts = [...monthRows]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div>
      <div className="mb-6 sm:mb-7 animate-fade-up">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
          {t("dashboard.greeting", { name: user?.full_name })}
        </h1>
        <p className="text-sm text-ink-400 mt-1">{t("dashboard.subtitle")}</p>
      </div>

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

      {/* ---------- Month-to-date summary ---------- */}
      <div className="card-soft p-5 mb-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-sprout-600" />
          <h2 className="font-display font-semibold text-ink-900">{t("dashboard.monthTitle")}</h2>
        </div>
        {monthLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-cream-50 rounded-xl p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-ink-400">{t("dashboard.monthProduced")}</div>
                <div className="font-mono font-bold text-sprout-600 mt-1">{monthProduced.toLocaleString()}</div>
              </div>
              <div className="bg-cream-50 rounded-xl p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-ink-400">{t("dashboard.monthSold")}</div>
                <div className="font-mono font-bold text-gold-600 mt-1">{monthSold.toLocaleString()}</div>
              </div>
              <div className="bg-cream-50 rounded-xl p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-ink-400">{t("dashboard.monthReturned")}</div>
                <div className="font-mono font-bold text-plum-500 mt-1">{monthReturned.toLocaleString()}</div>
              </div>
              <div className="bg-cream-50 rounded-xl p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-ink-400">{t("dashboard.monthRevenue")}</div>
                <div className="font-mono font-bold text-ink-900 mt-1">{monthRevenue.toLocaleString()} {t("dashboard.sum")}</div>
              </div>
            </div>

            {topProducts.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-ink-500 mb-2">{t("dashboard.topProducts")}</div>
                <div className="space-y-1.5">
                  {topProducts.map((r) => (
                    <div key={r.product_id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-cream-50">
                      <span className="text-ink-700 font-medium truncate pr-2">{r.product_name}</span>
                      <span className="font-mono text-ink-600 shrink-0">{r.revenue.toLocaleString()} {t("dashboard.sum")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* ---------- Recent operations ---------- */}
        <div className="card-soft p-5 animate-fade-up">
          <h2 className="font-display font-semibold text-ink-900 mb-3">{t("dashboard.recentOperations")}</h2>
          <div className="divide-y divide-ink-50">
            {operationsPreview.map((op, idx) => (
              <OperationRow key={idx} op={op} />
            ))}
            {allOperations.length === 0 && (
              <div className="text-sm text-ink-400 py-4">{t("dashboard.noOperations")}</div>
            )}
          </div>
          {allOperations.length > operationsPreview.length && (
            <button
              onClick={() => setOpsModalOpen(true)}
              className="mt-3 text-sm font-semibold text-sprout-600 hover:underline"
            >
              {t("dashboard.viewAll")}
            </button>
          )}
        </div>

        {/* ---------- Low stock ---------- */}
        <div className="card-soft p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-ink-900">{t("dashboard.lowStock")}</h2>
            <span className="pill-tag bg-cream-100 text-ink-500">{allLowStock.length}</span>
          </div>
          <div className="space-y-2">
            {lowStockPreview.map((p) => {
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
            {allLowStock.length === 0 && (
              <div className="text-sm text-ink-400 py-2">{t("dashboard.allSufficient")}</div>
            )}
          </div>
          {allLowStock.length > lowStockPreview.length && (
            <button
              onClick={() => setStockModalOpen(true)}
              className="mt-3 text-sm font-semibold text-sprout-600 hover:underline"
            >
              {t("dashboard.viewAll")}
            </button>
          )}
        </div>
      </div>

      {/* ---------- Modal: all recent operations ---------- */}
      <Modal
        open={opsModalOpen}
        onClose={() => setOpsModalOpen(false)}
        title={t("dashboard.recentOperations")}
        footer={
          <button className="btn-ghost" onClick={() => setOpsModalOpen(false)}>
            {t("dashboard.back")}
          </button>
        }
      >
        <div className="divide-y divide-ink-50 max-h-[65vh] sm:max-h-[60vh] overflow-y-auto -mx-1 px-1">
          {allOperations.map((op, idx) => (
            <OperationRow key={idx} op={op} />
          ))}
        </div>
      </Modal>

      {/* ---------- Modal: all low-stock products ---------- */}
      <Modal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title={t("dashboard.lowStock")}
        footer={
          <button className="btn-ghost" onClick={() => setStockModalOpen(false)}>
            {t("dashboard.back")}
          </button>
        }
      >
        <div className="space-y-2 max-h-[65vh] sm:max-h-[60vh] overflow-y-auto -mx-1 px-1">
          {allLowStock.map((p) => {
            const status = stockStatus(p.stock, p.minimum_stock, t);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm px-3.5 py-2.5 rounded-xl bg-cream-50"
              >
                <span className="text-ink-700 font-medium truncate pr-2">{p.name}</span>
                <span className={`pill-tag shrink-0 ${status.tone}`}>
                  {p.stock.toLocaleString()} {p.unit} · {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;