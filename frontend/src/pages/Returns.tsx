import React, { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { Product, ReturnRecord, PaginatedResponse } from "../types";
import OvalDropdown from "../components/OvalDropdown";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const PAGE_SIZE = 20;

const Returns: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<ReturnRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ReturnRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    customer: "",
    record_date: todayStr(),
    note: "",
  });

  const loadRecords = async (targetPage: number = page) => {
    setLoading(true);
    const r = await api.get<PaginatedResponse<ReturnRecord>>("/returns/", {
      params: { page: targetPage, page_size: PAGE_SIZE },
    });
    setRecords(r.data.items);
    setTotalPages(r.data.total_pages);
    setPage(r.data.page);
    setLoading(false);
  };

  const loadAll = async () => {
    const p = await api.get<PaginatedResponse<Product>>("/products/", {
      params: { active_only: true, page: 1, page_size: 200 },
    });
    setProducts(p.data.items);
    if (!form.product_id && p.data.items.length > 0) {
      setForm((f) => ({ ...f, product_id: String(p.data.items[0].id) }));
    }
    await loadRecords(1);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage: number) => {
    loadRecords(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.product_id || !form.quantity) {
      setError(t("returns.validationError"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/returns/", {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        customer: form.customer || null,
        record_date: form.record_date,
        note: form.note || null,
      });
      setSuccess(t("returns.success"));
      setForm({ ...form, quantity: "", customer: "", note: "" });
      loadRecords(1);
      setTimeout(() => setSuccess(""), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("returns.genericError"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/returns/${deleteTarget.id}`);
      const shouldStepBack = records.length === 1 && page > 1;
      setDeleteTarget(null);
      loadRecords(shouldStepBack ? page - 1 : page);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">{t("returns.title")}</h1>
        <p className="text-sm text-ink-400 mt-1">{t("returns.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="card-soft p-5 sm:p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label-soft">{t("returns.product")}</label>
          <OvalDropdown
            value={form.product_id}
            onChange={(value) => setForm({ ...form, product_id: value })}
            options={products.map((p) => ({ value: String(p.id), label: p.name }))}
            placeholder={t("returns.select")}
          />
        </div>
        <div>
          <label className="label-soft">{t("returns.quantity")}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="input-pill"
            placeholder="0"
          />
        </div>
        <div>
          <label className="label-soft">{t("returns.customer")}</label>
          <input
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
            className="input-pill"
            placeholder={t("returns.optional")}
          />
        </div>
        <div>
          <label className="label-soft">{t("returns.date")}</label>
          <input
            type="date"
            value={form.record_date}
            onChange={(e) => setForm({ ...form, record_date: e.target.value })}
            className="input-pill"
          />
        </div>
        <div>
          <label className="label-soft">{t("returns.note")}</label>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="input-pill"
            placeholder={t("returns.optional")}
          />
        </div>
        {error && <div className="sm:col-span-2 lg:col-span-5 text-sm text-clay-500 bg-clay-50 rounded-xl px-4 py-2.5">{error}</div>}
        {success && <div className="sm:col-span-2 lg:col-span-5 text-sm text-sprout-700 bg-sprout-50 rounded-xl px-4 py-2.5">{success}</div>}
        <div className="sm:col-span-2 lg:col-span-5">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : t("returns.submit")}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="card-soft p-5 text-sm text-ink-400 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {t("returns.loading")}
        </div>
      ) : records.length === 0 ? (
        <div className="card-soft px-6 py-10 text-center text-ink-400">{t("returns.noRecords")}</div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {records.map((r) => (
              <div key={r.id} className="card-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{r.product_name}</div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {r.record_date} · {r.created_by_name}
                    </div>
                    {r.customer && <div className="text-xs text-ink-400 mt-0.5">{r.customer}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="pill-tag bg-plum-50 text-plum-500">↺ {r.quantity}</span>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="btn-icon hover:bg-clay-50 hover:text-clay-600"
                      aria-label={t("returns.delete")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block card-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-50">
                    <th className="table-head-cell sticky left-0 bg-cream-50 z-10">{t("returns.table.date")}</th>
                    <th className="table-head-cell">{t("returns.table.product")}</th>
                    <th className="table-head-cell">{t("returns.table.quantity")}</th>
                    <th className="table-head-cell">{t("returns.table.customer")}</th>
                    <th className="table-head-cell">{t("returns.table.createdBy")}</th>
                    <th className="table-head-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="table-cell text-ink-500 sticky left-0 bg-white z-10">{r.record_date}</td>
                      <td className="table-cell font-medium text-ink-700">{r.product_name}</td>
                      <td className="table-cell">
                        <span className="pill-tag bg-plum-50 text-plum-500">↺ {r.quantity}</span>
                      </td>
                      <td className="table-cell text-ink-500">{r.customer ?? "—"}</td>
                      <td className="table-cell text-ink-500">{r.created_by_name}</td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="btn-icon hover:bg-clay-50 hover:text-clay-600"
                          aria-label={t("returns.delete")}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={t("common.confirmTitle")}
        message={t("returns.deleteConfirm")}
        confirmLabel={t("returns.delete")}
        cancelLabel={t("common.cancel")}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Returns;