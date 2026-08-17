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
  ChevronDown,
  User as UserIcon,
  KeyRound,
  LogOut,
  Undo2,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import DropMark from "./DropMark";
import Modal from "./Modal";
import ChangePasswordForm from "./ChangePasswordForm";

const navItems = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/products", key: "nav.products", icon: Package, adminOnly: false },
  { to: "/production", key: "nav.production", icon: Factory, adminOnly: false },
  { to: "/sales", key: "nav.sales", icon: Receipt, adminOnly: false },
  { to: "/returns", key: "nav.returns", icon: Undo2, adminOnly: false },
  { to: "/warehouse", key: "nav.warehouse", icon: WarehouseIcon, adminOnly: false },
  { to: "/reports", key: "nav.reports", icon: BarChart3, adminOnly: true },
  { to: "/users", key: "nav.users", icon: Users, adminOnly: true },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const visibleItems = navItems.filter((i) => !i.adminOnly || user?.role === "admin");
  const canChangeOwnPassword = user?.role === "admin";

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
    setMenuOpen(false);
  };

  const LangToggle = () => (
    <div className="lang-toggle-dark">
      <button
        className={i18n.language === "ky" ? "active" : ""}
        onClick={() => i18n.changeLanguage("ky")}
      >
        KG
      </button>
      <button
        className={i18n.language === "ru" ? "active" : ""}
        onClick={() => i18n.changeLanguage("ru")}
      >
        RU
      </button>
    </div>
  );

  const ProfileCard = ({ stacked }: { stacked?: boolean }) => (
    <div className="relative" ref={stacked ? profileRef : undefined}>
      <button
        onClick={() => setProfileMenuOpen((v) => !v)}
        className="profile-mini-dark w-full"
      >
        <div className="avatar-gradient">
          {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="text-left min-w-0 flex-1">
          <div className="text-sm font-bold text-white truncate">{user?.full_name}</div>
          <div className="text-[11px] text-white/55">
            {user?.role === "admin" ? t("roles.admin") : t("roles.employee")}
          </div>
        </div>
        <ChevronDown
          size={15}
          className={`text-white/50 transition-transform duration-200 shrink-0 ${profileMenuOpen ? "rotate-180" : ""}`}
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
            {t("profile.myProfile")}
          </button>
          {canChangeOwnPassword && (
            <button
              className="dropdown-item"
              onClick={() => {
                setProfileMenuOpen(false);
                setPasswordModalOpen(true);
              }}
            >
              <KeyRound size={16} className="text-ink-400" />
              {t("profile.changePassword")}
            </button>
          )}
          <button className="dropdown-item text-clay-500 hover:bg-clay-50 hover:text-clay-600" onClick={handleLogout}>
            <LogOut size={16} />
            {t("profile.logout")}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row">
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 lg:w-64 shrink-0 sidebar-dark p-3 lg:p-4">
        <div className="flex items-center gap-2.5 px-2 py-4 lg:py-5 relative z-10">
          <div className="brand-icon-tile">
            <DropMark size={22} />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[14px] lg:text-[15px] font-extrabold leading-tight truncate">{t("app.name")}</div>
            <div className="text-[10px] lg:text-[11px] text-white/55 truncate">{t("app.subtitle")}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 relative z-10 mt-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `nav-link-dark ${isActive ? "nav-link-dark-active" : ""}`}
              >
                <Icon size={18} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{t(item.key)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="relative z-10 space-y-2.5 mt-3">
          <LangToggle />
          <ProfileCard stacked />
        </div>
      </aside>

      {/* Mobile header + drawer — a single sticky block that lives in normal document
          flow. The drawer renders as a normal sibling right after the header row
          (not an absolutely-positioned overlay with a guessed pixel offset), so it
          can never overlap or get clipped by the header regardless of its real
          rendered height on any device. */}
      <div className="md:hidden sticky top-0 z-30 sidebar-dark">
        <div className="flex items-center justify-between px-4 py-3 relative z-10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 shrink-0"
            aria-label={t("profile.menu")}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display font-bold text-white text-sm truncate">{t("app.name")}</span>
            <div className="brand-icon-tile w-8 h-8 shrink-0">
              <DropMark size={18} />
            </div>
          </div>
        </div>

        {menuOpen && (
          <nav className="relative z-10 px-3 pb-4 pt-1 space-y-1 max-h-[calc(100vh-56px)] overflow-y-auto animate-slide-down">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `nav-link-dark ${isActive ? "nav-link-dark-active" : ""}`}
                >
                  <Icon size={18} />
                  {t(item.key)}
                </NavLink>
              );
            })}
            <div className="pt-4 mt-3 border-t border-white/10 space-y-2.5">
              <LangToggle />
              <ProfileCard />
            </div>
          </nav>
        )}
      </div>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">{children}</div>
      </main>

      <Modal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} title={t("profile.myProfile")}>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-ink-50">
            <span className="text-ink-400">{t("profile.fullName")}</span>
            <span className="font-medium text-ink-900">{user?.full_name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ink-50">
            <span className="text-ink-400">{t("profile.username")}</span>
            <span className="font-medium text-ink-900">{user?.username}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ink-50">
            <span className="text-ink-400">{t("profile.role")}</span>
            <span className="pill-tag bg-sprout-50 text-sprout-700">
              {user?.role === "admin" ? t("roles.admin") : t("roles.employee")}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-ink-400">{t("profile.accountStatus")}</span>
            <span className="pill-tag bg-sprout-50 text-sprout-700">{t("profile.active")}</span>
          </div>
        </div>
      </Modal>

      {canChangeOwnPassword && (
        <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title={t("profile.changePassword")}>
          <ChangePasswordForm onDone={() => setPasswordModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Layout;