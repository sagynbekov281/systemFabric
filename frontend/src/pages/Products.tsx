import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { Product, PaginatedResponse } from "../types";
import { useAuth } from "../context/AuthContext";
import OvalDropdown from "../components/OvalDropdown";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

const emptyForm = { name: "", unit: "литр", price: "", minimum_stock: "" };
const PAGE_SIZE = 20;

const isValidName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
};

const stockStatus = (stock: number, minimum: number, t: (k: string) => string) => {
  if (stock <= 0) return { label: t("dashboard.stock.out"), tone: "bg-clay-50 text-clay-600" };
  if (stock <= minimum) return { label: t("dashboard.stock.low"), tone: "bg-gold-50 text-gold-600" };
  return { label: t("dashboard.stock.ok"), tone: "bg-sprout-100 text-sprout-700" };
};

const Products: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === "admin";
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (targetPage: number = page) => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<Product>>("/products/", {
      params: { page: targetPage, page_size: PAGE_SIZE },
    });
    setProducts(res.data.items);
    setTotalPages(res.data.total_pages);
    setPage(res.data.page);
    setLoading(false);
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage: number) => {
    load(newPage);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidName(form.name)) {
      setError(t("products.nameError"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit,
        price: form.price ? Number(form.price) : null,
        minimum_stock: form.minimum_stock ? Number(form.minimum_stock) : 0,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products/", payload);
      }
      resetForm();
      load(editingId ? page : 1);
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("products.genericError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      unit: p.unit,
      price: p.price != null ? String(p.price) : "",
      minimum_stock: p.minimum_stock != null ? String(p.minimum_stock) : "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      // If we just deleted the last item on this page, step back a page
      const shouldStepBack = products.length === 1 && page > 1;
      load(shouldStepBack ? page - 1 : page);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">{t("products.title")}</h1>
          <p className="text-sm text-ink-400 mt-1">{t("products.subtitle")}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            {t("products.addButton")}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="card-soft p-5 sm:p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-soft">{t("products.name")}</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-pill"
              placeholder={t("products.namePlaceholder")}
            />
          </div>
          <div>
            <label className="label-soft">{t("products.unit")}</label>
            <OvalDropdown
              value={form.unit}
              onChange={(value) => setForm({ ...form, unit: value })}
              options={[
                { value: "литр", label: "литр" },
                { value: "кг", label: "кг" },
                { value: "даана", label: "даана" },
              ]}
              placeholder={t("products.select")}
            />
          </div>
          <div>
            <label className="label-soft">{t("products.price")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-pill"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label-soft">{t("products.minStock")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.minimum_stock}
              onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })}
              className="input-pill"
              placeholder="0"
            />
          </div>
          {error && <div className="sm:col-span-2 lg:col-span-4 text-sm text-clay-500">{error}</div>}
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? t("products.save") : t("products.add")}
            </button>
            <button type="button" onClick={resetForm} className="btn-ghost">
              {t("products.back")}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card-soft p-5 text-sm text-ink-400 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {t("products.loading")}
        </div>
      ) : products.length === 0 ? (
        <div className="card-soft px-6 py-10 text-center text-ink-400">{t("products.noProducts")}</div>
      ) : (
        <>
          {/* ---------- Mobile: card list ---------- */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => {
              const status = stockStatus(p.stock, p.minimum_stock, t);
              return (
                <div key={p.id} className="card-soft p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                      <div className="text-xs text-ink-400 mt-0.5">{p.unit}</div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleEdit(p)} className="btn-icon" aria-label={t("products.edit")}>
                          <Pencil size={15} />
                        </button>
                        {p.is_active && (
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="btn-icon hover:bg-clay-50 hover:text-clay-600"
                            aria-label={t("products.delete")}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-ink-50">
                    <span className="text-ink-500">{p.price != null ? `${p.price.toLocaleString()} сом` : "—"}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`pill-tag ${status.tone}`}>{p.stock.toLocaleString()}</span>
                      <span className={`pill-tag ${p.is_active ? "bg-sprout-100 text-sprout-700" : "bg-ink-50 text-ink-400"}`}>
                        {p.is_active ? t("products.active") : t("products.inactive")}
                      </span>
                    </div>
                  </div>
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
                    <th className="table-head-cell sticky left-0 bg-cream-50 z-10">{t("products.table.name")}</th>
                    <th className="table-head-cell">{t("products.table.unit")}</th>
                    <th className="table-head-cell">{t("products.table.price")}</th>
                    <th className="table-head-cell">{t("products.table.stock")}</th>
                    <th className="table-head-cell">{t("products.table.status")}</th>
                    {isAdmin && <th className="table-head-cell"></th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const status = stockStatus(p.stock, p.minimum_stock, t);
                    return (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell font-medium text-ink-700 sticky left-0 bg-white z-10">{p.name}</td>
                        <td className="table-cell text-ink-500">{p.unit}</td>
                        <td className="table-cell text-ink-500">{p.price != null ? p.price.toLocaleString() : "—"}</td>
                        <td className="table-cell">
                          <span className={`pill-tag ${status.tone}`}>{p.stock.toLocaleString()}</span>
                        </td>
                        <td className="table-cell">
                          <span
                            className={`pill-tag ${
                              p.is_active ? "bg-sprout-100 text-sprout-700" : "bg-ink-50 text-ink-400"
                            }`}
                          >
                            {p.is_active ? t("products.active") : t("products.inactive")}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="table-cell text-right whitespace-nowrap">
                            <button onClick={() => handleEdit(p)} className="btn-icon" aria-label={t("products.edit")}>
                              <Pencil size={15} />
                            </button>
                            {p.is_active && (
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="btn-icon hover:bg-clay-50 hover:text-clay-600"
                                aria-label={t("products.delete")}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t("products.deleteModal.title")}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>
              {t("products.deleteModal.cancel")}
            </button>
            <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 size={16} className="animate-spin" /> : t("products.deleteModal.confirm")}
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          {t("products.deleteModal.text", { name: deleteTarget?.name })}
        </p>
      </Modal>
    </div>
  );
};

export default Products;