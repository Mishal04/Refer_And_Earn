import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoMark from "./Logo";

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <LogoMark size={36} />
    <span className="font-display font-bold text-lg" style={{ color: "var(--color-text)" }}>
      Apexora Referrals
    </span>
  </div>
);

const referrerNav = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/messages",
    label: "Messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const adminNav = [
  {
    to: "/admin",
    label: "Admin Panel",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    to: "/messages",
    label: "Messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: "/users",
    label: "Users",
    badge: "⭐ NEW",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const NavItem = ({ to, label, icon, badge, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? "text-white shadow-sm"
          : "hover:text-[var(--color-primary)]"
      }`
    }
    style={({ isActive }) =>
      isActive
        ? { backgroundColor: "var(--color-primary)", color: "#fff" }
        : { color: "var(--color-muted)" }
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <span style={{ color: isActive ? "#fff" : "var(--color-muted)" }}>{icon}</span>
          <span>{label}</span>
        </div>
        {badge && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: isActive ? "var(--color-accent)" : "#FEF3C7",
              color: "#92400E",
            }}
          >
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = user?.role === "admin" ? adminNav : referrerNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 min-h-screen flex-shrink-0 sticky top-0 h-screen p-5"
        style={{
          backgroundColor: "var(--color-surface)",
          borderRight: "1.5px solid var(--color-border)",
        }}
      >
        <div className="mb-8">
          <Logo />
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} badge={item.badge} />
          ))}
        </nav>

        {/* User chip + logout */}
        <div
          className="mt-auto pt-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
                {user?.role === "admin" ? "Administrator" : "Referrer"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full text-sm font-medium py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "#FBEAEA",
              color: "#9B2C2C",
              border: "1.5px solid #F5C6C6",
            }}
          >
            Log out
          </motion.button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1.5px solid var(--color-border)",
        }}
      >
        <Logo />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg"
          style={{ color: "var(--color-muted)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-20 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-30 w-60 flex flex-col p-5"
              style={{
                backgroundColor: "var(--color-surface)",
                borderRight: "1.5px solid var(--color-border)",
              }}
            >
              <div className="mb-8 mt-1">
                <Logo />
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {nav.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    badge={item.badge}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
                      {user?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
                      {user?.role === "admin" ? "Administrator" : "Referrer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-sm font-medium py-2 rounded-lg"
                  style={{ backgroundColor: "#FBEAEA", color: "#9B2C2C" }}
                >
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-w-0 md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
};

export default Layout;
