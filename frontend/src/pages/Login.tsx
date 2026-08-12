import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DropMark from "../components/DropMark";

// Customize here once the factory's real name/branding is ready.
const FACTORY_NAME = "Сүт заводунун системасы";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Колдонуучунун атын киргизиңиз");
      return;
    }
    if (!password) {
      setError("Паролду киргизиңиз");
      return;
    }

    setLoading(true);
    try {
      await login(trimmedUsername, password);
      navigate("/");
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 403 || /inactive|активсиз/i.test(detail || "")) {
        setError("Бул аккаунт активсиз. Администраторго кайрылыңыз.");
      } else if (status === 401) {
        setError("Колдонуучунун аты же пароль туура эмес");
      } else {
        setError(detail || "Кирүүдө ката кетти. Кайра аракет кылыңыз.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-8">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-milk-50 mb-4">
              <DropMark size={30} />
            </div>
            <h1 className="font-display text-xl font-bold text-ink-900">{FACTORY_NAME}</h1>
            <p className="text-sm text-ink-400 mt-1.5">Кирүү үчүн логин жана паролду киргизиңиз</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label-soft">Колдонуучунун аты</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-pill"
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label-soft">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-pill"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-clay-600 bg-clay-50 rounded-xl px-4 py-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <span className="spinner" /> : "Кирүү"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;