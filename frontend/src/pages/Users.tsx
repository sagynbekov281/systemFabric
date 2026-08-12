import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { User } from "../types";
import OvalDropdown from "../components/OvalDropdown";

const emptyForm = { username: "", full_name: "", role: "employee" as "employee" | "admin", password: "" };

const Users: React.FC = () => {
  const { t } = useTranslation();
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
      setError(err?.response?.data?.detail || t("users.genericError"));
    }
  };

  const toggleActive = async (u: User) => {
    await api.put(`/users/${u.id}`, { is_active: !u.is_active });
    load();
  };

  const handleDelete = async (u: User) => {
    if (!confirm(t("users.deleteConfirm", { name: u.full_name }))) return;
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || t("users.genericError"));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{t("users.title")}</h1>
          <p className="text-sm text-ink-400 mt-1">{t("users.subtitle")}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? t("users.close") : t("users.addButton")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-soft p-6 mb-6 grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label-soft">{t("users.username")}</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-pill"
            />
          </div>
          <div>
            <label className="label-soft">{t("users.fullName")}</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input-pill"
            />
          </div>
          <div>
            <label className="label-soft">{t("users.role")}</label>
            <OvalDropdown
              value={form.role}
              onChange={(value) => setForm({ ...form, role: value as "employee" | "admin" })}
              options={[
                { value: "employee", label: t("users.roleOptions.employee") },
                { value: "admin", label: t("users.roleOptions.admin") },
              ]}
              placeholder={t("users.select")}
            />
          </div>
          <div>
            <label className="label-soft">{t("users.password")}</label>
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
              {t("users.add")}
            </button>
          </div>
        </form>
      )}

      <div className="card-soft overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-ink-400">{t("users.loading")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b-[1.5px] border-ink-900 bg-cream-100">
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.username")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.fullName")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.role")}</th>
                  <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.status")}</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-ink-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-medium text-ink-700">{u.username}</td>
                    <td className="px-6 py-3.5 text-ink-600">{u.full_name}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`pill-tag ${
                          u.role === "admin" ? "bg-plum-50 text-plum-500" : "bg-milk-50 text-milk-600"
                        }`}
                      >
                        {u.role === "admin" ? t("roles.admin") : t("roles.employee")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`pill-tag ${
                          u.is_active ? "bg-milk-50 text-milk-600" : "bg-cream-100 text-ink-400"
                        }`}
                      >
                        {u.is_active ? t("users.active") : t("users.inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(u)}
                        className="text-milk-600 text-xs font-semibold mr-4 hover:underline"
                      >
                        {u.is_active ? t("users.deactivate") : t("users.activate")}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-clay-500 text-xs font-semibold hover:underline"
                      >
                        {t("users.delete")}
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