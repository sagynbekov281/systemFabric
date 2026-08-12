import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import api from "../api";
import { Product } from "../types";
import { useAuth } from "../context/AuthContext";
import OvalDropdown from "../components/OvalDropdown";
import Modal from "../components/Modal";

const emptyForm = { name: "", unit: "литр", price: "", minimum_stock: "" };

const isValidName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  // reject purely numeric junk like "234" or "876678"
  if (/^\d+$/.test(trimmed)) return false;
  return true;
};

const stockStatus = (stock: number, minimum: number) => {
  if (stock <= 0) return { label: "түгөндү", tone: "bg-clay-50 text-clay-600" };
  if (stock <= minimum) return { label: "аз калды", tone: "bg-gold-50 text-gold-600" };
  return { label: "жетиштүү", tone: "bg-milk-50 text-milk-700" };
};

const Products: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get<Product[]>("/products/");
    setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

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
      setError("Аталышы жок дегенде 2 тамгадан турушу керек жана санда гана болбошу керек");
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
      load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ката кетти");
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
      // Products already in use elsewhere should be archived rather than
      // hard-deleted — /products/:id DELETE is expected to do that server-side.
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Товарлар</h1>
          <p className="text-sm text-ink-400 mt-1">Продукциялардын тизмеси жана кампадагы калдыктар</p>
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
            Товар кошуу
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-soft">Аталышы</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-pill"
              placeholder="Мисалы: Кефир 1л"
            />
          </div>
          <div>
            <label className="label-soft">Бирдик</label>
            <OvalDropdown
              value={form.unit}
              onChange={(value) => setForm({ ...form, unit: value })}
              options={[
                { value: "литр", label: "литр" },
                { value: "кг", label: "кг" },
                { value: "даана", label: "даана" },
              ]}
              placeholder="Тандоо"
            />
          </div>
          <div>
            <label className="label-soft">Баасы</label>
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
            <label className="label-soft">Минималдуу калдык</label>
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
              {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? "Сактоо" : "Кошуу"}
            </button>
            <button type="button" onClick={resetForm} className="btn-ghost">
              Артка
            </button>
          </div>
        </form>
      )}

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Жүктөлүүдө...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50">
                  <th className="table-head-cell">Аталышы</th>
                  <th className="table-head-cell">Бирдик</th>
                  <th className="table-head-cell">Баасы</th>
                  <th className="table-head-cell">Калдык</th>
                  <th className="table-head-cell">Абал</th>
                  {isAdmin && <th className="table-head-cell"></th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const status = stockStatus(p.stock, p.minimum_stock);
                  return (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell font-medium text-ink-700">{p.name}</td>
                      <td className="table-cell text-ink-500">{p.unit}</td>
                      <td className="table-cell text-ink-500">{p.price != null ? p.price.toLocaleString() : "—"}</td>
                      <td className="table-cell">
                        <span className={`pill-tag ${status.tone}`}>{p.stock.toLocaleString()}</span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`pill-tag ${
                            p.is_active ? "bg-milk-50 text-milk-700" : "bg-ink-50 text-ink-400"
                          }`}
                        >
                          {p.is_active ? "активдүү" : "активсиз"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="table-cell text-right whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(p)}
                            className="btn-icon"
                            aria-label="Өзгөртүү"
                          >
                            <Pencil size={15} />
                          </button>
                          {p.is_active && (
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="btn-icon hover:bg-clay-50 hover:text-clay-600"
                              aria-label="Өчүрүү"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-ink-400">
                      Товарлар табылган жок
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Товарды өчүрүү"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>
              Жокко чыгаруу
            </button>
            <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 size={16} className="animate-spin" /> : "Өчүрүү"}
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{deleteTarget?.name}</span> товарын өчүрүүнү каалайсызбы? Мурда
          колдонулган болсо, ал активсиз статусуна которулат.
        </p>
      </Modal>
    </div>
  );
};

export default Products;