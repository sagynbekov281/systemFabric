import React, { useEffect, useState } from "react";
import { Package, Factory, Receipt, Wallet, ArrowUp, ArrowDown } from "lucide-react";
import api from "../api";
import { DashboardSummary } from "../types";
import { useAuth } from "../context/AuthContext";

const StatCard: React.FC<{
  label: string;
  icon: React.ElementType;
  tint: string;
  children: React.ReactNode;
}> = ({ label, icon: Icon, tint, children }) => (
  <div className="card-soft p-5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tint}`}>
      <Icon size={18} strokeWidth={2} />
    </div>
    <div className="text-[12px] font-medium text-ink-400">{label}</div>
    <div className="mt-1">{children}</div>
  </div>
);

const stockStatus = (stock: number, minimum: number) => {
  if (stock <= 0) return { label: "түгөндү", tone: "bg-clay-50 text-clay-600" };
  if (stock <= minimum) return { label: "аз калды", tone: "bg-gold-50 text-gold-600" };
  return { label: "жетиштүү", tone: "bg-milk-50 text-milk-700" };
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardSummary>("/reports/dashboard");
      setData(res.data);
    } catch (e) {
      setError("Маалыматтарды жүктөөдө ката кетти");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card-soft p-5 h-28 animate-pulse bg-ink-50/50" />
        ))}
      </div>
    );
  }
  if (error) return <div className="text-sm text-clay-500 bg-clay-50 rounded-xl px-4 py-3 inline-block">{error}</div>;
  if (!data) return null;

  // today_produced_by_unit: [{ unit, quantity }] — see note on DashboardSummary below.
  const producedByUnit = data.today_produced_by_unit?.length
    ? data.today_produced_by_unit
    : [{ unit: "", quantity: data.today_produced }];

  const lowStock = data.low_stock_products.filter((p) => p.stock <= p.minimum_stock);

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-bold text-ink-900">Салам, {user?.full_name}! 👋</h1>
        <p className="text-sm text-ink-400 mt-1">Бүгүнкү жалпы көрсөткүчтөр</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Активдүү товарлар" icon={Package} tint="bg-milk-50 text-milk-600">
          <div className="font-display text-2xl font-bold text-ink-900">{data.total_products}</div>
        </StatCard>

        <StatCard label="Бүгүн өндүрүлдү" icon={Factory} tint="bg-milk-50 text-milk-600">
          <div className="space-y-0.5">
            {producedByUnit.map((row, idx) => (
              <div key={idx} className="font-display text-lg font-bold text-ink-900">
                {row.quantity.toLocaleString()} {row.unit}
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard label="Бүгүн сатылды" icon={Receipt} tint="bg-gold-50 text-gold-600">
          <div className="font-display text-2xl font-bold text-ink-900">{data.today_sold.toLocaleString()}</div>
        </StatCard>

        <StatCard label="Бүгүнкү киреше" icon={Wallet} tint="bg-plum-50 text-plum-500">
          <div className="font-display text-2xl font-bold text-ink-900">{data.today_revenue.toLocaleString()} сом</div>
        </StatCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-soft p-5">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Акыркы операциялар</h2>
          <div className="divide-y divide-ink-50">
            {(data.recent_operations || []).slice(0, 8).map((op, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2.5 text-sm">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    op.type === "production" ? "bg-milk-50 text-milk-600" : "bg-gold-50 text-gold-600"
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
                <div className={`font-display font-semibold ${op.type === "production" ? "text-milk-600" : "text-gold-600"}`}>
                  {op.type === "production" ? "+" : "-"}
                  {op.quantity} {op.unit}
                </div>
              </div>
            ))}
            {(!data.recent_operations || data.recent_operations.length === 0) && (
              <div className="text-sm text-ink-400 py-4">Операциялар табылган жок</div>
            )}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-ink-900">Кампада аз калган товарлар</h2>
            <span className="pill-tag bg-cream-100 text-ink-500">{lowStock.length}</span>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => {
              const status = stockStatus(p.stock, p.minimum_stock);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm px-3.5 py-2.5 rounded-xl bg-cream-50">
                  <span className="text-ink-700 font-medium">{p.name}</span>
                  <span className={`pill-tag ${status.tone}`}>
                    {p.stock.toLocaleString()} {p.unit} · {status.label}
                  </span>
                </div>
              );
            })}
            {lowStock.length === 0 && (
              <div className="text-sm text-ink-400 py-2">Бардык товарлар жетиштүү</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;