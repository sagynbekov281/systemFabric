import React, { useEffect, useState } from "react";
import api from "../api";
import { DashboardSummary } from "../types";
import { useAuth } from "../context/AuthContext";

const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  accent: string;
  chip: string;
}> = ({ label, value, hint, accent, chip }) => (
  <div className="card-soft p-5 relative overflow-hidden">
    <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 ${chip}`} />
    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm mb-3 ${accent}`}>
      ●
    </div>
    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</div>
    <div className="font-display text-2xl font-bold text-ink-900 mt-0.5">{value}</div>
    {hint && <div className="text-xs text-ink-400 mt-1">{hint}</div>}
  </div>
);

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

  if (loading) return <div className="text-ink-400 text-sm">Жүктөлүүдө...</div>;
  if (error) return <div className="text-clay-500 text-sm">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-bold text-ink-900">Салам, {user?.full_name}! 👋</h1>
        <p className="text-sm text-ink-400 mt-1">Бүгүнкү жалпы көрсөткүчтөр</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Активдүү товарлар"
          value={String(data.total_products)}
          accent="bg-milk-50 text-milk-500"
          chip="bg-milk-500"
        />
        <StatCard
          label="Бүгүн өндүрүлдү"
          value={data.today_produced.toLocaleString()}
          accent="bg-milk-50 text-milk-500"
          chip="bg-milk-500"
        />
        <StatCard
          label="Бүгүн сатылды"
          value={data.today_sold.toLocaleString()}
          accent="bg-gold-50 text-gold-600"
          chip="bg-gold-500"
        />
        <StatCard
          label="Бүгүнкү киреше"
          value={`${data.today_revenue.toLocaleString()} сом`}
          accent="bg-plum-50 text-plum-500"
          chip="bg-plum-500"
        />
      </div>

      <div className="card-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-900">Кампадагы калдыктар (аз калгандар)</h2>
          <span className="pill-tag bg-cream-100 text-ink-500">
            Жалпы: {data.total_stock.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2">
          {data.low_stock_products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between text-sm px-4 py-3 rounded-2xl bg-cream-50/80"
            >
              <span className="text-ink-700 font-medium">{p.name}</span>
              <span
                className={`pill-tag ${
                  p.stock <= 0
                    ? "bg-clay-50 text-clay-500"
                    : p.stock < 20
                    ? "bg-gold-50 text-gold-600"
                    : "bg-milk-50 text-milk-600"
                }`}
              >
                {p.stock.toLocaleString()} {p.unit}
              </span>
            </div>
          ))}
          {data.low_stock_products.length === 0 && (
            <div className="text-sm text-ink-400">Дайын товар жок</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
