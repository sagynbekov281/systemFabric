import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DropMark from "../components/DropMark";

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
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Кирүүдө ката кетти. Кайра аракет кылыңыз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wave-cream px-4 relative overflow-hidden">
      {/* decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-milk-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-gold-100/60 blur-3xl" />

      <div className="relative w-full max-w-sm bg-white rounded-4xl shadow-soft border border-ink-50 p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-milk-50 to-gold-50 mb-4">
            <DropMark size={34} />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">Сүт заводунун системасы</h1>
          <p className="text-sm text-ink-400 mt-1.5">Кирүү үчүн логин жана паролду киргизиңиз</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-soft">Колдонуучунун аты</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-pill"
              placeholder="admin"
              required
              autoFocus
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
              required
            />
          </div>

          {error && (
            <div className="text-sm text-clay-500 bg-clay-50 border border-clay-100 rounded-2xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Кирүүдө..." : "Кирүү"}
          </button>
        </form>

        <div className="text-xs text-ink-400 text-center mt-6 leading-relaxed">
          Сынак үчүн: <span className="font-semibold text-ink-500">admin / admin123</span> (администратор)
          <br />
          же <span className="font-semibold text-ink-500">worker / worker123</span> (кызматкер)
        </div>
      </div>
    </div>
  );
};

export default Login;
