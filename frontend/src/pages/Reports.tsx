import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../api";
import { ReportRow } from "../types";
import OvalDropdown from "../components/OvalDropdown";

const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

type GroupBy = "day" | "week" | "month" | "year";

const Reports: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(monthAgoStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get<ReportRow[]>("/reports/summary", {
      params: { date_from: dateFrom, date_to: dateTo, group_by: groupBy },
    });
    setRows(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = Object.values(
    rows.reduce((acc: Record<string, any>, r) => {
      if (!acc[r.period]) acc[r.period] = { period: r.period, produced: 0, sold: 0 };
      acc[r.period].produced += r.produced;
      acc[r.period].sold += r.sold;
      return acc;
    }, {})
  ).sort((a: any, b: any) => (a.period > b.period ? 1 : -1));

  const totalProduced = rows.reduce((s, r) => s + r.produced, 0);
  const totalSold = rows.reduce((s, r) => s + r.sold, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Отчеттор</h1>
        <p className="text-sm text-ink-400 mt-1">Күндүк, жумалык, айлык жана жылдык отчеттор</p>
      </div>

      <div className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-4">
        <div>
          <label className="label-soft">Баштап</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-pill"
          />
        </div>
        <div>
          <label className="label-soft">Чейин</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-pill"
          />
        </div>
        <div>
          <label className="label-soft">Топтоо</label>
          <OvalDropdown
            value={groupBy}
            onChange={(value) => setGroupBy(value as GroupBy)}
            options={[
              { value: "day", label: "Күн сайын" },
              { value: "week", label: "Жума сайын" },
              { value: "month", label: "Ай сайын" },
              { value: "year", label: "Жыл сайын" },
            ]}
            placeholder="Тандоо"
          />
        </div>
        <div className="flex items-end">
          <button onClick={load} className="btn-primary w-full">
            Отчет чыгаруу
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Жалпы өндүрүлдү</div>
          <div className="font-display text-xl font-bold text-milk-600 mt-1">{totalProduced.toLocaleString()}</div>
        </div>
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Жалпы сатылды</div>
          <div className="font-display text-xl font-bold text-gold-600 mt-1">{totalSold.toLocaleString()}</div>
        </div>
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Жалпы киреше</div>
          <div className="font-display text-xl font-bold text-plum-500 mt-1">{totalRevenue.toLocaleString()} сом</div>
        </div>
      </div>

      <div className="card-soft p-6 mb-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">Мезгил боюнча график</h2>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE2" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#7A8A87" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7A8A87" }} />
              <Tooltip
                contentStyle={{ borderRadius: 16, border: "1px solid #F3F5F4", fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="produced" name="Өндүрүлдү" fill="#1F6F5C" radius={[8, 8, 0, 0]} />
              <Bar dataKey="sold" name="Сатылды" fill="#E0A428" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400">Жүктөлүүдө...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b border-ink-50">
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Мезгил</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Товар</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Өндүрүлдү</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Сатылды</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Киреше</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-b border-ink-50/60 last:border-0 hover:bg-cream-50/60 transition-colors">
                    <td className="px-6 py-3.5 text-ink-500">{r.period}</td>
                    <td className="px-6 py-3.5 font-medium text-ink-700">{r.product_name}</td>
                    <td className="px-6 py-3.5 text-milk-600">{r.produced.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-gold-600">{r.sold.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-plum-500">{r.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-ink-400">
                      Маалымат жок
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
