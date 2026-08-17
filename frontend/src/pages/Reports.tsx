import React, { useEffect, useMemo, useState } from "react";
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
import Pagination from "../components/Pagination";

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const monthAgoStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

type GroupBy = "day" | "week" | "month" | "year";
const PAGE_SIZE = 20;

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState(monthAgoStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const res = await api.get<ReportRow[]>("/reports/summary", {
      params: { date_from: dateFrom, date_to: dateTo, group_by: groupBy },
    });
    setRows(res.data);
    setPage(1);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  // Chart uses the FULL dataset (not just the current page) so trends stay accurate
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
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">{t("reports.title")}</h1>
        <p className="text-sm text-ink-400 mt-1">{t("reports.subtitle")}</p>
      </div>

      <div className="card-soft p-5 sm:p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="card-soft p-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-400">{t("reports.totalProduced")}</div>
          <div className="font-mono text-xl font-bold text-sprout-600 mt-1 tabular-nums">{totalProduced.toLocaleString()}</div>
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

      <div className="card-soft p-4 sm:p-6 mb-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">{t("reports.chartTitle")}</h2>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D5C6" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#4A473A", fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fontSize: 10, fill: "#4A473A", fontFamily: "JetBrains Mono" }} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 2, border: "1.5px solid #131209", fontSize: 12, fontFamily: "JetBrains Mono" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Bar dataKey="produced" name={t("reports.produced")} fill="#16A05F" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sold" name={t("reports.sold")} fill="#BD8814" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading ? (
        <div className="card-soft p-5 text-sm text-ink-400">{t("reports.loading")}</div>
      ) : rows.length === 0 ? (
        <div className="card-soft px-6 py-10 text-center text-ink-400">{t("reports.noData")}</div>
      ) : (
        <>
          {/* ---------- Mobile: card list ---------- */}
          <div className="sm:hidden space-y-3">
            {pageItems.map((r, idx) => (
              <div key={idx} className="card-soft p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-ink-400">{r.period}</span>
                  <span className="font-semibold text-ink-900 text-sm truncate">{r.product_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-ink-50">
                  <div>
                    <div className="text-[10px] text-ink-400 uppercase">{t("reports.table.produced")}</div>
                    <div className="font-mono font-bold text-sprout-600 text-sm">{r.produced.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-400 uppercase">{t("reports.table.sold")}</div>
                    <div className="font-mono font-bold text-gold-600 text-sm">{r.sold.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-400 uppercase">{t("reports.table.revenue")}</div>
                    <div className="font-mono font-bold text-plum-500 text-sm">{r.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Tablet / desktop: table ---------- */}
          <div className="hidden sm:block card-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-400 border-b-[1.5px] border-ink-900 bg-cream-100">
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide sticky left-0 bg-cream-100 z-10">{t("reports.table.period")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.product")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.produced")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.sold")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("reports.table.revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((r, idx) => (
                    <tr key={idx} className="border-b border-ink-100 last:border-0 hover:bg-sprout-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-ink-500 sticky left-0 bg-white z-10">{r.period}</td>
                      <td className="px-6 py-3.5 font-medium text-ink-700">{r.product_name}</td>
                      <td className="px-6 py-3.5 font-mono text-sprout-600 tabular-nums">{r.produced.toLocaleString()}</td>
                      <td className="px-6 py-3.5 font-mono text-gold-600 tabular-nums">{r.sold.toLocaleString()}</td>
                      <td className="px-6 py-3.5 font-mono text-plum-500 tabular-nums">{r.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Reports;