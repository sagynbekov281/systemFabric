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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        <h1 className="font-display text-2xl font-bold text-ink-900">{t("reports.title")}</h1>
        <p className="text-sm text-ink-400 mt-1">{t("reports.subtitle")}</p>
      </div>

      <div className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-4">
        <div>
          <label className="label-soft">{t("reports.from")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-pill font-mono"
          />
        </div>
        <div>
          <label className="label-soft">{t("reports.to")}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-pill font-mono"
          />
        </div>
        <div>
          <label className="label-soft">{t("reports.groupBy")}</label>
          <OvalDropdown
            value={groupBy}
            onChange={(value) => setGroupBy(value as GroupBy)}
            options={[
              { value: "day", label: t("reports.group.day") },
              { value: "week", label: t("reports.group.week") },
              { value: "month", label: t("reports.group.month") },
              { value: "year", label: t("reports.group.year") },
            ]}
            placeholder={t("reports.select")}
          />
        </div>
        <div className="flex items-end">
          <button onClick={load} className="btn-primary w-full">
            {t("reports.generate")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400">{t("reports.totalProduced")}</div>
          <div className="font-mono text-xl font-bold text-milk-600 mt-1 tabular-nums">{totalProduced.toLocaleString()}</div>
        </div>
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400">{t("reports.totalSold")}</div>
          <div className="font-mono text-xl font-bold text-gold-600 mt-1 tabular-nums">{totalSold.toLocaleString()}</div>
        </div>
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400">{t("reports.totalRevenue")}</div>
          <div className="font-mono text-xl font-bold text-plum-500 mt-1 tabular-nums">
            {totalRevenue.toLocaleString()} {t("reports.sum")}
          </div>
        </div>
      </div>

      <div className="card-soft p-6 mb-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">{t("reports.chartTitle")}</h2>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D5C6" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#4A473A", fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4A473A", fontFamily: "JetBrains Mono" }} />
              <Tooltip
                contentStyle={{ borderRadius: 2, border: "1.5px solid #131209", fontSize: 13, fontFamily: "JetBrains Mono" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "JetBrains Mono" }} />
              <Bar dataKey="produced" name={t("reports.produced")} fill="#22386D" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sold" name={t("reports.sold")} fill="#A06F0E" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400">{t("reports.loading")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b-[1.5px] border-ink-900 bg-cream-100">
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.period")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.product")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.produced")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.sold")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.revenue")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-b border-ink-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-ink-500">{r.period}</td>
                    <td className="px-6 py-3.5 font-medium text-ink-700">{r.product_name}</td>
                    <td className="px-6 py-3.5 font-mono text-milk-600 tabular-nums">{r.produced.toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-mono text-gold-600 tabular-nums">{r.sold.toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-mono text-plum-500 tabular-nums">{r.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-ink-400">
                      {t("reports.noData")}
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