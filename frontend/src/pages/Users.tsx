import React, { useEffect, useState } from "react";
import api from "../api";
import { User } from "../types";
import OvalDropdown from "../components/OvalDropdown";

const emptyForm = { username: "", full_name: "", role: "employee" as "employee" | "admin", password: "" };

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get<User[]>("/users/");
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users/", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ката кетти");
    }
  };

  const toggleActive = async (u: User) => {
    await api.put(`/users/${u.id}`, { is_active: !u.is_active });
    load();
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`${u.full_name} колдонуучусун өчүрөсүзбү?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Ката кетти");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Кызматкерлер</h1>
          <p className="text-sm text-ink-400 mt-1">Колдонуучуларды жана укуктарды башкаруу</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Жабуу" : "+ Кызматкер кошуу"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label-soft">Колдонуучунун аты</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-pill"
            />
          </div>
          <div>
            <label className="label-soft">Аты-жөнү</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input-pill"
            />
          </div>
          <div>
            <label className="label-soft">Ролу</label>
            <OvalDropdown
              value={form.role}
              onChange={(value) => setForm({ ...form, role: value as "employee" | "admin" })}
              options={[
                { value: "employee", label: "Кызматкер" },
                { value: "admin", label: "Администратор" },
              ]}
              placeholder="Тандоо"
            />
          </div>
          <div>
            <label className="label-soft">Пароль</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-pill"
            />
          </div>
          {error && <div className="sm:col-span-4 text-sm text-clay-500">{error}</div>}
          <div className="sm:col-span-4">
            <button type="submit" className="btn-primary">
              Кошуу
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
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Колдонуучу</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Аты-жөнү</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Ролу</th>
                  <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Абал</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50/60 last:border-0 hover:bg-cream-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-ink-700">{u.username}</td>
                    <td className="px-6 py-3.5 text-ink-600">{u.full_name}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`pill-tag ${
                          u.role === "admin" ? "bg-plum-50 text-plum-500" : "bg-milk-50 text-milk-600"
                        }`}
                      >
                        {u.role === "admin" ? "администратор" : "кызматкер"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`pill-tag ${
                          u.is_active ? "bg-milk-50 text-milk-600" : "bg-cream-100 text-ink-400"
                        }`}
                      >
                        {u.is_active ? "активдүү" : "активсиз"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(u)}
                        className="text-milk-600 text-xs font-semibold mr-4 hover:underline"
                      >
                        {u.is_active ? "Токтотуу" : "Активдештирүү"}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-clay-500 text-xs font-semibold hover:underline"
                      >
                        Өчүрүү
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
