import React, { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { Product, ProductionRecord } from "../types";
import { useAuth } from "../context/AuthContext";
import OvalDropdown from "../components/OvalDropdown";

const todayStr = () => new Date().toISOString().slice(0, 10);

const Production: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    record_date: todayStr(),
    note: "",
  });

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      api.get<Product[]>("/products/", { params: { active_only: true } }),
      api.get<ProductionRecord[]>("/production/"),
    ]);
    setProducts(p.data);
    setRecords(r.data);
    if (!form.product_id && p.data.length > 0) {
      setForm((f) => ({ ...f, product_id: String(p.data[0].id) }));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProduct = products.find((p) => String(p.id) === form.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.product_id || !form.quantity) {
      setError(t("production.validationError"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/production/", {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        record_date: form.record_date,
        note: form.note || null,
      });
      setSuccess(t("production.success"));
      setForm({ ...form, quantity: "", note: "" });
      load();
      setTimeout(() => setSuccess(""), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("production.genericError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("production.deleteConfirm"))) return;
    await api.delete(`/production/${id}`);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">{t("production.title")}</h1>
        <p className="text-sm text-ink-400 mt-1">{t("production.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-4">
        <div>
          <label className="label-soft">{t("production.product")}</label>
          <OvalDropdown
            value={form.product_id}
            onChange={(value) => setForm({ ...form, product_id: value })}
            options={products.map((p) => ({ value: String(p.id), label: p.name }))}
            placeholder={t("production.select")}
          />
        </div>
        <div>
          <label className="label-soft">
            {t("production.quantity")} {selectedProduct && <span className="text-ink-400">({selectedProduct.unit})</span>}
          </label>
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
          <label className="label-soft">{t("production.date")}</label>
          <input
            type="date"
            value={form.record_date}
            onChange={(e) => setForm({ ...form, record_date: e.target.value })}
            className="input-pill"
          />
        </div>
        <div>
          <label className="label-soft">{t("production.note")}</label>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="input-pill"
          />
        </div>
        {error && <div className="sm:col-span-4 text-sm text-clay-500 bg-clay-50 rounded-xl px-4 py-2.5">{error}</div>}
        {success && <div className="sm:col-span-4 text-sm text-milk-700 bg-milk-50 rounded-xl px-4 py-2.5">{success}</div>}
        <div className="sm:col-span-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : t("production.submit")}
          </button>
        </div>
      </form>

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> {t("production.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50">
                  <th className="table-head-cell">{t("production.table.date")}</th>
                  <th className="table-head-cell">{t("production.table.product")}</th>
                  <th className="table-head-cell">{t("production.table.quantity")}</th>
                  <th className="table-head-cell">{t("production.table.createdBy")}</th>
                  <th className="table-head-cell"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell text-ink-500">{r.record_date}</td>
                    <td className="table-cell font-medium text-ink-700">{r.product_name}</td>
                    <td className="table-cell">
                      <span className="pill-tag bg-milk-50 text-milk-700">+{r.quantity}</span>
                    </td>
                    <td className="table-cell text-ink-500">{r.created_by_name}</td>
                    <td className="table-cell text-right">
                      {(user?.role === "admin" || user?.username) && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="btn-icon hover:bg-clay-50 hover:text-clay-600"
                          aria-label={t("production.delete")}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-ink-400">
                      {t("production.noRecords")}
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

export default Production;