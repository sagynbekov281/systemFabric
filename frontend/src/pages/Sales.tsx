import React, { useEffect, useState } from "react";
import api from "../api";
import { Product, SaleRecord } from "../types";
import OvalDropdown from "../components/OvalDropdown";

const todayStr = () => new Date().toISOString().slice(0, 10);

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    price: "",
    customer: "",
    record_date: todayStr(),
    note: "",
  });

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      api.get<Product[]>("/products/", { params: { active_only: true } }),
      api.get<SaleRecord[]>("/sales/"),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.product_id || !form.quantity) {
      setError("Товарды жана санды толтуруңуз");
      return;
    }
    try {
      await api.post("/sales/", {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        price: form.price ? Number(form.price) : null,
        customer: form.customer || null,
        record_date: form.record_date,
        note: form.note || null,
      });
      setSuccess("Ийгиликтүү катталды!");
      setForm({ ...form, quantity: "", price: "", customer: "", note: "" });
      load();
      setTimeout(() => setSuccess(""), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ката кетти");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Бул жазууну өчүрөсүзбү?")) return;
    await api.delete(`/sales/${id}`);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Сатуу</h1>
        <p className="text-sm text-ink-400 mt-1">Сатылган товарларды каттоо</p>
      </div>

      <form onSubmit={handleSubmit} className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="label-soft">Товар</label>
          <OvalDropdown
            value={form.product_id}
            onChange={(value) => setForm({ ...form, product_id: value })}
            options={products.map((p) => ({ value: String(p.id), label: `${p.name} (калдык: ${p.stock})` }))}
            placeholder="Тандоо"
          />
        </div>
        <div>
          <label className="label-soft">Саны</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="input-pill font-mono"
            placeholder="0"
          />
        </div>
        <div>
          <label className="label-soft">Баасы (бирдиги)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input-pill font-mono"
            placeholder="милдеттүү эмес"
          />
        </div>
        <div>
          <label className="label-soft">Кардар</label>
          <input
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
            className="input-pill"
            placeholder="милдеттүү эмес"
          />
        </div>
        <div>
          <label className="label-soft">Күнү</label>
          <input
            type="date"
            value={form.record_date}
            onChange={(e) => setForm({ ...form, record_date: e.target.value })}
            className="input-pill font-mono"
          />
        </div>
        <div>
          <label className="label-soft">Эскертүү</label>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="input-pill"
            placeholder="милдеттүү эмес"
          />
        </div>
        {error && <div className="sm:col-span-3 lg:col-span-6 text-sm text-clay-500">{error}</div>}
        {success && (
          <div className="sm:col-span-3 lg:col-span-6 text-sm text-milk-600">{success}</div>
        )}
        <div className="sm:col-span-3 lg:col-span-6">
          <button type="submit" className="btn-primary">
            Катталуу
          </button>
        </div>
      </form>

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400">Жүктөлүүдө...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b-[1.5px] border-ink-900 bg-cream-100">
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">Күнү</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">Товар</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">Саны</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">Баасы</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">Кардар</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">Кимден</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-ink-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-ink-500">{r.record_date}</td>
                    <td className="px-6 py-3.5 font-medium text-ink-700">{r.product_name}</td>
                    <td className="px-6 py-3.5">
                      <span className="pill-tag bg-gold-50 text-gold-600">-{r.quantity}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-ink-500">{r.price ?? "—"}</td>
                    <td className="px-6 py-3.5 text-ink-500">{r.customer ?? "—"}</td>
                    <td className="px-6 py-3.5 text-ink-500">{r.created_by_name}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-clay-500 text-xs font-semibold hover:underline"
                      >
                        Өчүрүү
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-ink-400">
                      Жазуулар жок
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

export default Sales;