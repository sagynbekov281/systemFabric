import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { User, PaginatedResponse } from "../types";
import OvalDropdown from "../components/OvalDropdown";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import Modal from "../components/Modal";

const emptyForm = { username: "", full_name: "", role: "employee" as "employee" | "admin", password: "" };
const emptyEditForm = { username: "", full_name: "", role: "employee" as "employee" | "admin", password: "" };
const PAGE_SIZE = 20;

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = async (targetPage: number = page) => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<User>>("/users/", {
      params: { page: targetPage, page_size: PAGE_SIZE },
    });
    setUsers(res.data.items);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users/", form);
      setForm(emptyForm);
      setShowForm(false);
      load(1);
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("users.genericError"));
    }
  };

  const toggleActive = async (u: User) => {
    await api.put(`/users/${u.id}`, { is_active: !u.is_active });
    load(page);
  };

  const openEdit = (u: User) => {
    setEditTarget(u);
    setEditForm({ username: u.username, full_name: u.full_name, role: u.role, password: "" });
    setEditError("");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm(emptyEditForm);
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError("");
    setEditSaving(true);
    try {
      const payload: Record<string, any> = {
        username: editForm.username,
        full_name: editForm.full_name,
        role: editForm.role,
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }
      await api.put(`/users/${editTarget.id}`, payload);
      closeEdit();
      load(page);
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || t("users.genericError"));
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError("");
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      const shouldStepBack = users.length === 1 && page > 1;
      setDeleteTarget(null);
      load(shouldStepBack ? page - 1 : page);
    } catch (err: any) {
      setListError(err?.response?.data?.detail || t("users.genericError"));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">{t("users.title")}</h1>
          <p className="text-sm text-ink-400 mt-1">{t("users.subtitle")}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? t("users.close") : t("users.addButton")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-soft p-5 sm:p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          {error && <div className="sm:col-span-2 lg:col-span-4 text-sm text-clay-500">{error}</div>}
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className="btn-primary">
              {t("users.add")}
            </button>
          </div>
        </form>
      )}

      {listError && (
        <div className="mb-4 text-sm text-clay-600 bg-clay-50 rounded-xl px-4 py-3">{listError}</div>
      )}

      {loading ? (
        <div className="card-soft p-5 text-sm text-ink-400">{t("users.loading")}</div>
      ) : users.length === 0 ? (
        <div className="card-soft px-6 py-10 text-center text-ink-400">—</div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className="card-soft p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{u.full_name}</div>
                    <div className="text-xs text-ink-400 mt-0.5 font-mono">{u.username}</div>
                  </div>
                  <span
                    className={`pill-tag shrink-0 ${
                      u.role === "admin" ? "bg-plum-50 text-plum-500" : "bg-sprout-100 text-sprout-700"
                    }`}
                  >
                    {u.role === "admin" ? t("roles.admin") : t("roles.employee")}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-ink-50">
                  <span
                    className={`pill-tag ${
                      u.is_active ? "bg-sprout-100 text-sprout-700" : "bg-cream-100 text-ink-400"
                    }`}
                  >
                    {u.is_active ? t("users.active") : t("users.inactive")}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(u)} className="text-plum-500 text-xs font-semibold">
                      {t("users.edit")}
                    </button>
                    <button onClick={() => toggleActive(u)} className="text-sprout-700 text-xs font-semibold">
                      {u.is_active ? t("users.deactivate") : t("users.activate")}
                    </button>
                    <button onClick={() => setDeleteTarget(u)} className="text-clay-500 text-xs font-semibold">
                      {t("users.delete")}
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
                  <tr className="text-left text-ink-400 border-b-[1.5px] border-ink-900 bg-cream-100">
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide sticky left-0 bg-cream-100 z-10">{t("users.table.username")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.fullName")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.role")}</th>
                    <th className="px-6 py-3.5 font-mono font-semibold text-[11px] uppercase tracking-wide">{t("users.table.status")}</th>
                    <th className="px-6 py-3.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-ink-100 last:border-0 hover:bg-sprout-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-medium text-ink-700 sticky left-0 bg-white z-10">{u.username}</td>
                      <td className="px-6 py-3.5 text-ink-600">{u.full_name}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`pill-tag ${
                            u.role === "admin" ? "bg-plum-50 text-plum-500" : "bg-sprout-100 text-sprout-700"
                          }`}
                        >
                          {u.role === "admin" ? t("roles.admin") : t("roles.employee")}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`pill-tag ${
                            u.is_active ? "bg-sprout-100 text-sprout-700" : "bg-cream-100 text-ink-400"
                          }`}
                        >
                          {u.is_active ? t("users.active") : t("users.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-plum-500 text-xs font-semibold mr-4 hover:underline"
                        >
                          {t("users.edit")}
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className="text-sprout-700 text-xs font-semibold mr-4 hover:underline"
                        >
                          {u.is_active ? t("users.deactivate") : t("users.activate")}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
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
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={t("common.confirmTitle")}
        message={t("users.deleteConfirm", { name: deleteTarget?.full_name })}
        confirmLabel={t("users.delete")}
        cancelLabel={t("common.cancel")}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal open={!!editTarget} onClose={closeEdit} title={t("users.edit")}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="label-soft">{t("users.username")}</label>
            <input
              required
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="input-pill"
            />
          </div>
          <div>
            <label className="label-soft">{t("users.fullName")}</label>
            <input
              required
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="input-pill"
            />
          </div>
          <div>
            <label className="label-soft">{t("users.role")}</label>
            <OvalDropdown
              value={editForm.role}
              onChange={(value) => setEditForm({ ...editForm, role: value as "employee" | "admin" })}
              options={[
                { value: "employee", label: t("users.roleOptions.employee") },
                { value: "admin", label: t("users.roleOptions.admin") },
              ]}
              placeholder={t("users.select")}
            />
          </div>
          <div>
            <label className="label-soft">{t("users.newPasswordOptional")}</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="input-pill"
              placeholder={t("users.leaveBlankToKeep")}
            />
          </div>
          {editError && <div className="text-sm text-clay-500 bg-clay-50 rounded-xl px-4 py-2.5">{editError}</div>}
          <button type="submit" disabled={editSaving} className="btn-primary w-full">
            {editSaving ? <span className="spinner" /> : t("users.save")}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;