import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Factory,
  Receipt,
  BarChart3,
  Users,
  Menu,
  X,
  ChevronUp,
  User as UserIcon,
  KeyRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DropMark from "./DropMark";
import Modal from "./Modal";
import ChangePasswordForm from "./ChangePasswordForm";

const navItems = [
  { to: "/", label: "Башкы бет", icon: LayoutDashboard, adminOnly: false },
  { to: "/products", label: "Товарлар", icon: Package, adminOnly: false },
  { to: "/production", label: "Өндүрүш", icon: Factory, adminOnly: false },
  { to: "/sales", label: "Сатуу", icon: Receipt, adminOnly: false },
  { to: "/reports", label: "Отчеттор", icon: BarChart3, adminOnly: true },
  { to: "/users", label: "Кызматкерлер", icon: Users, adminOnly: true },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const visibleItems = navItems.filter((i) => !i.adminOnly || user?.role === "admin");

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const ProfileCard = ({ stacked }: { stacked?: boolean }) => (
    <div className="relative" ref={stacked ? profileRef : undefined}>
      <button
        onClick={() => setProfileMenuOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-ink-100 bg-white hover:border-milk-200 hover:bg-milk-50/40 transition-colors duration-150"
      >
        <div className="w-9 h-9 rounded-full bg-milk-100 text-milk-700 flex items-center justify-center font-semibold text-sm shrink-0">
          {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="text-left min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink-900 truncate">{user?.full_name}</div>
          <div className="text-[11px] text-ink-400">
            {user?.role === "admin" ? "Администратор" : "Кызматкер"}
          </div>
        </div>
        <ChevronUp
          size={16}
          className={`text-ink-400 transition-transform duration-150 ${profileMenuOpen ? "" : "rotate-180"}`}
        />
      </button>

      {profileMenuOpen && (
        <div className="dropdown-panel bottom-full left-0 right-0 mb-2">
          <button
            className="dropdown-item"
            onClick={() => {
              setProfileMenuOpen(false);
              setProfileModalOpen(true);
            }}
          >
            <UserIcon size={16} className="text-ink-400" />
            Менин профилим
          </button>
          <button
            className="dropdown-item"
            onClick={() => {
              setProfileMenuOpen(false);
              setPasswordModalOpen(true);
            }}
          >
            <KeyRound size={16} className="text-ink-400" />
            Пароль өзгөртүү
          </button>
          <button className="dropdown-item text-clay-500" onClick={handleLogout}>
            <LogOut size={16} />
            Чыгуу
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-ink-100 shrink-0">
        <div className="px-5 py-6 flex items-center gap-2.5">
          <DropMark size={28} />
          <div>
            <div className="font-display text-[15px] font-bold text-ink-900 leading-tight">Сүт заводу</div>
            <div className="text-[11px] text-ink-400">Ички башкаруу</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-milk-50 text-milk-700"
                      : "text-ink-500 hover:bg-ink-50 hover:text-ink-700"
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-3 mb-4 mt-2">
          <ProfileCard stacked />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-ink-100 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <DropMark size={24} />
          <span className="font-display font-bold text-ink-900 text-sm">Сүт заводу</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn-icon bg-ink-50"
          aria-label="Меню"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 z-20 bg-white border-b border-ink-100 shadow-popover">
          <nav className="px-3 py-3 space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium ${
                      isActive ? "bg-milk-50 text-milk-700" : "text-ink-500 hover:bg-ink-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
            <div className="pt-3 mt-2 border-t border-ink-50 px-1">
              <ProfileCard />
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-[57px] md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>

      <Modal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Менин профилим">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-ink-50">
            <span className="text-ink-400">Аты-жөнү</span>
            <span className="font-medium text-ink-900">{user?.full_name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ink-50">
            <span className="text-ink-400">Username</span>
            <span className="font-medium text-ink-900">{user?.username}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ink-50">
            <span className="text-ink-400">Ролу</span>
            <span className="pill-tag bg-milk-50 text-milk-700">
              {user?.role === "admin" ? "администратор" : "кызматкер"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-ink-400">Аккаунт статусу</span>
            <span className="pill-tag bg-milk-50 text-milk-700">активдүү</span>
          </div>
        </div>
      </Modal>

      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Пароль өзгөртүү">
        <ChangePasswordForm onDone={() => setPasswordModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Layout;