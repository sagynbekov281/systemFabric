import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DropMark from "./DropMark";

const navItems = [
  { to: "/", label: "Башкы бет", icon: "📊", adminOnly: false },
  { to: "/products", label: "Товарлар", icon: "🥛", adminOnly: false },
  { to: "/production", label: "Өндүрүш", icon: "🏭", adminOnly: false },
  { to: "/sales", label: "Сатуу", icon: "🧾", adminOnly: false },
  { to: "/reports", label: "Отчеттор", icon: "📈", adminOnly: false },
  { to: "/users", label: "Кызматкерлер", icon: "👥", adminOnly: true },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = navItems.filter((i) => !i.adminOnly || user?.role === "admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/70 backdrop-blur-sm border-r border-ink-50 shrink-0">
        <div className="px-5 py-6 flex items-center gap-2.5">
          <DropMark size={30} />
          <div>
            <div className="font-display text-[15px] font-bold text-ink-900 leading-tight">Сүт заводу</div>
            <div className="text-[11px] text-ink-400">Ички башкаруу</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-milk-500 text-white shadow-glow"
                    : "text-ink-500 hover:bg-milk-50 hover:text-milk-700"
                }`
              }
            >
              <span className="text-[15px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mx-3 mb-4 mt-2 px-4 py-4 rounded-3xl bg-gradient-to-br from-milk-50 to-cream-100 border border-milk-100">
          <div className="text-sm font-semibold text-ink-700 truncate">{user?.full_name}</div>
          <div className="text-[11px] text-ink-400 mb-3">
            {user?.role === "admin" ? "Администратор" : "Кызматкер"}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs font-semibold text-clay-500 bg-white rounded-full py-2 hover:bg-clay-50 transition-colors"
          >
            Чыгуу
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-ink-50 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <DropMark size={24} />
          <span className="font-display font-bold text-ink-900 text-sm">Сүт заводу</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-milk-50 text-milk-700 text-lg leading-none"
          aria-label="Меню"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 z-20 bg-white border-b border-ink-50 shadow-soft">
          <nav className="px-3 py-3 space-y-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-3 rounded-full text-sm font-medium ${
                    isActive ? "bg-milk-500 text-white" : "text-ink-500 hover:bg-milk-50"
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-2 border-t border-ink-50 px-3">
              <div className="text-sm font-semibold text-ink-700">{user?.full_name}</div>
              <div className="text-[11px] text-ink-400 mb-2">
                {user?.role === "admin" ? "Администратор" : "Кызматкер"}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-sm font-semibold text-clay-500 border border-clay-100 rounded-full py-2.5 hover:bg-clay-50"
              >
                Чыгуу
              </button>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-[57px] md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
