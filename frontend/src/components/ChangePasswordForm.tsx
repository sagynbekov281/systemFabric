import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

interface Props {
  onDone: () => void;
}

const ChangePasswordForm: React.FC<Props> = ({ onDone }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError(t("changePassword.minLengthError"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("changePassword.mismatchError"));
      return;
    }

    setLoading(true);
    try {
      // NOTE: adjust the endpoint/payload to match your actual auth API.
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(onDone, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("changePassword.genericError"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="text-sm text-milk-700 bg-milk-50 rounded-xl px-4 py-3">{t("changePassword.success")}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-soft">{t("changePassword.currentPassword")}</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input-pill"
        />
      </div>
      <div>
        <label className="label-soft">{t("changePassword.newPassword")}</label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-pill"
        />
      </div>
      <div>
        <label className="label-soft">{t("changePassword.confirmPassword")}</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-pill"
        />
      </div>
      {error && <div className="text-sm text-clay-500 bg-clay-50 rounded-xl px-4 py-2.5">{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <span className="spinner" /> : t("changePassword.save")}
      </button>
    </form>
  );
};

export default ChangePasswordForm;