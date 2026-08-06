import React, { useEffect, useState } from "react";
import api from "../api";
import { Product } from "../types";
import { useAuth } from "../context/AuthContext";
import OvalDropdown from "../components/OvalDropdown";

const emptyForm = { name: "", unit: "литр", description: "" };

const Products: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

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
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products/", form);
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ката кетти");
    }
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, unit: p.unit, description: p.description || "" });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Бул товарды өчүрөсүзбү? (активсиз болот)")) return;
    await api.delete(`/products/${id}`);
    load();
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
            {showForm ? "Жабуу" : "+ Товар кошуу"}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-2">
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
            <label className="label-soft">Өлчөм бирдиги</label>
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
          <div className="sm:col-span-2">
            <label className="label-soft">Сүрөттөмө (милдеттүү эмес)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-pill"
            />
          </div>
          {error && <div className="sm:col-span-2 text-sm text-clay-500">{error}</div>}
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">
              {editingId ? "Сактоо" : "Кошуу"}
            </button>
            <button type="button" onClick={resetForm} className="btn-ghost">
              Артка
            </button>
          </div>
        </form>
      )}

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400">Жүктөлүүдө...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b border-ink-50">
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Аталышы</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Бирдик</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Калдык</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Абал</th>
                  {isAdmin && <th className="px-6 py-3.5"></th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-ink-50/60 last:border-0 hover:bg-cream-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-ink-700">{p.name}</td>
                    <td className="px-6 py-3.5 text-ink-500">{p.unit}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`pill-tag ${
                          p.stock <= 0
                            ? "bg-clay-50 text-clay-500"
                            : p.stock < 20
                            ? "bg-gold-50 text-gold-600"
                            : "bg-milk-50 text-milk-600"
                        }`}
                      >
                        {p.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`pill-tag ${
                          p.is_active ? "bg-milk-50 text-milk-600" : "bg-cream-100 text-ink-400"
                        }`}
                      >
                        {p.is_active ? "активдүү" : "активсиз"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-milk-600 text-xs font-semibold mr-4 hover:underline"
                        >
                          Өзгөртүү
                        </button>
                        {p.is_active && (
                          <button
                            onClick={() => handleDeactivate(p.id)}
                            className="text-clay-500 text-xs font-semibold hover:underline"
                          >
                            Өчүрүү
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-ink-400">
                      Товарлар табылган жок
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

export default Products;
