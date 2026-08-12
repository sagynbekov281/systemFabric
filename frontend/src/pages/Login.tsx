import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoFull from "../assets/logo_full_transparent.png";

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
      setError("Введите имя пользователя");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }

    setLoading(true);
    try {
      await login(trimmedUsername, password);
      navigate("/");
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 403 || /inactive|активсиз|неактивен/i.test(detail || "")) {
        setError("Этот аккаунт неактивен. Обратитесь к администратору.");
      } else if (status === 401) {
        setError("Неверное имя пользователя или пароль");
      } else {
        setError(detail || "Ошибка при входе. Попробуйте снова.");
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
            <img src={logoFull} alt="ОсОО Мыйзам — молочная фабрика" className="h-24 mx-auto mb-3 object-contain" />
            <p className="text-sm text-ink-400 mt-1.5">Введите логин и пароль для входа</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label-soft">Имя пользователя</label>
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
              {loading ? <span className="spinner" /> : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;