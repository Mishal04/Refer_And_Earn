import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Layout from "../components/Layout";
import CountUp from "../components/CountUp";
import NetworkVisualSmall from "../components/NetworkVisualSmall";
import Messages from "./Messages";

// ─── Helpers & Badges ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut", delay },
});

const STATUS_BADGE = {
  pending:     { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  reviewed:    { bg: "#DBEAFE", color: "#1E40AF", label: "Reviewed" },
  approved:    { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
  in_progress: { bg: "#EDE9FE", color: "#5B21B6", label: "In Progress" },
  completed:   { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
  rejected:    { bg: "#FBEAEA", color: "#9B2C2C", label: "Rejected" },
};

const WITHDRAWAL_BADGE = {
  requested: { bg: "#FEF3C7", color: "#92400E", label: "Requested" },
  approved:  { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
  rejected:  { bg: "#FBEAEA", color: "#9B2C2C", label: "Rejected" },
  paid:      { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
};

const Badge = ({ status, map }) => {
  const s = map[status] || { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </motion.span>
  );
};

const Toast = ({ msg, type = "success" }) =>
  msg ? (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
      style={
        type === "success"
          ? { backgroundColor: "#D1FAE5", color: "#065F46", border: "1.5px solid #6EE7B7" }
          : { backgroundColor: "#FBEAEA", color: "#9B2C2C", border: "1.5px solid #FCA5A5" }
      }
    >
      <span>{type === "success" ? "✓" : "⚠️"}</span>
      <span>{msg}</span>
    </motion.div>
  ) : null;

const inputClass = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white";
const inputStyle = { border: "1.5px solid var(--color-border)" };
const inputFocus = (e) => (e.target.style.borderColor = "var(--color-primary)");
const inputBlur = (e) => (e.target.style.borderColor = "var(--color-border)");

const SkeletonCard = () => (
  <div
    className="rounded-2xl p-5 animate-pulse"
    style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
  >
    <div className="h-2.5 w-20 rounded mb-3" style={{ backgroundColor: "var(--color-border)" }} />
    <div className="h-8 w-14 rounded" style={{ backgroundColor: "var(--color-border)" }} />
  </div>
);

// ─── Analytics Tab with Interactive Click Cards ──────────────────────────────

const SummaryCards = ({ summary, loading, leads, withdrawals, topReferrers, onRefresh, showToast }) => {
  const [selectedCardKey, setSelectedCardKey] = useState("totalLeads");
  const [leadActionLoading, setLeadActionLoading] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const s = summary || {};

  const cards = [
    { key: "totalLeads", label: "Total Leads", value: s.totalLeads ?? 0, icon: "📋", accent: false },
    { key: "completedLeads", label: "Completed", value: s.completedLeads ?? 0, icon: "✅", accent: false },
    { key: "pendingLeads", label: "Pending", value: s.pendingLeads ?? 0, icon: "⏳", accent: false },
    { key: "conversionRate", label: "Conversion Rate", value: s.conversionRate ?? 0, icon: "📈", accent: true, suffix: "%", decimals: 1 },
    { key: "totalRevenue", label: "Total Revenue", value: s.totalRevenue ?? 0, icon: "💰", accent: true, prefix: "Rs. " },
    { key: "totalCommissionsPaid", label: "Commissions Paid", value: s.totalCommissionsPaid ?? 0, icon: "🏆", accent: false, prefix: "Rs. " },
    { key: "totalReferrers", label: "Active Referrers", value: s.totalReferrers ?? 0, icon: "👥", accent: false },
    { key: "pendingWithdrawals", label: "Pending Withdrawals", value: s.pendingWithdrawals ?? 0, icon: "🏦", accent: false },
  ];

  const handleQuickLeadStatus = async (leadId, status) => {
    setLeadActionLoading(leadId);
    try {
      await api.put(`/leads/${leadId}`, { status });
      onRefresh();
      showToast(`Lead status updated to ${status}!`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update lead", "error");
    } finally {
      setLeadActionLoading(null);
    }
  };

  const activeCardObj = cards.find((c) => c.key === selectedCardKey) || cards[0];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
            Overview Metrics (Click card to view detailed data)
          </p>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#166534" }}>
            Live Analytics
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c, i) => {
            const isSelected = selectedCardKey === c.key;
            return (
              <motion.button
                key={c.key}
                type="button"
                {...fadeUp(i * 0.04)}
                whileHover={{ y: -4, boxShadow: "0 12px 24px -12px rgba(45,27,78,0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCardKey(c.key)}
                className="text-left rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden group"
                style={{
                  backgroundColor: c.accent ? "var(--color-primary)" : "var(--color-surface)",
                  background: c.accent
                    ? "linear-gradient(135deg, #1C1032 0%, #2D1B4E 70%, #22143D 100%)"
                    : "var(--color-surface)",
                  border: isSelected
                    ? "2.5px solid var(--color-accent)"
                    : c.accent
                    ? "none"
                    : "1.5px solid var(--color-border)",
                  boxShadow: isSelected ? "0 0 0 4px rgba(217,119,6,0.2)" : "none",
                }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-xl mb-1.5">{c.icon}</p>
                  {isSelected && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--color-accent)", color: "#1D1429" }}
                    >
                      Selected 🔍
                    </span>
                  )}
                </div>
                <p
                  className="text-2xl font-display font-bold tracking-tight"
                  style={{ color: c.accent ? "var(--color-accent)" : "var(--color-text)" }}
                >
                  <CountUp
                    value={c.value}
                    prefix={c.prefix || ""}
                    suffix={c.suffix || ""}
                    decimals={c.decimals || 0}
                  />
                </p>
                <p
                  className="text-xs font-medium mt-1"
                  style={{
                    color: c.accent ? "rgba(255,255,255,0.75)" : "var(--color-muted)",
                  }}
                >
                  {c.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Interactive Detailed Data Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCardKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
        >
          {/* Header */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeCardObj.icon}</span>
              <div>
                <h3 className="font-display font-bold text-base" style={{ color: "var(--color-text)" }}>
                  Detailed Breakdown: {activeCardObj.label}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  Contextual insights and real-time records for this metric
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCardKey("totalLeads")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-stone-100"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-muted)" }}
            >
              Reset View
            </button>
          </div>

          <div className="p-6">
            {/* 1. Total Leads Breakdown */}
            {selectedCardKey === "totalLeads" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                  <span>Showing all {leads.length} submitted leads across platform</span>
                  <span>Sorted by date (latest first)</span>
                </div>
                {leads.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "var(--color-muted)" }}>No leads recorded yet.</p>
                ) : (
                  <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                    {leads.slice(0, 8).map((l) => (
                      <div key={l._id} className="py-3 flex items-center justify-between text-xs gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: "var(--color-text)" }}>{l.clientName}</p>
                          <p style={{ color: "var(--color-muted)" }}>by {l.referredBy?.name || "Unknown"} • {l.clientContact}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                            {l.projectValue > 0 ? `Rs. ${l.projectValue.toLocaleString()}` : "Value unassigned"}
                          </span>
                          <Badge status={l.status} map={STATUS_BADGE} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Completed Leads Breakdown */}
            {selectedCardKey === "completedLeads" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#D1FAE5", border: "1px solid #6EE7B7" }}>
                  <div>
                    <p className="text-xs uppercase font-bold" style={{ color: "#065F46" }}>Successful Conversions</p>
                    <p className="text-xl font-bold font-display" style={{ color: "#065F46" }}>
                      {leads.filter((l) => l.status === "completed").length} Completed Deals
                    </p>
                  </div>
                  <span className="text-3xl">🎉</span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {leads.filter((l) => l.status === "completed").map((l) => (
                    <div key={l._id} className="py-3 flex items-center justify-between text-xs gap-3">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-text)" }}>{l.clientName}</p>
                        <p style={{ color: "var(--color-muted)" }}>Referred by {l.referredBy?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">Rs. {l.projectValue?.toLocaleString()}</p>
                        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>15% Commission Distributed</p>
                      </div>
                    </div>
                  ))}
                  {leads.filter((l) => l.status === "completed").length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>No completed deals yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* 3. Pending Leads Breakdown */}
            {selectedCardKey === "pendingLeads" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                  Leads awaiting review & action:
                </p>
                <div className="space-y-3">
                  {leads.filter((l) => l.status === "pending" || l.status === "reviewed").map((l) => (
                    <div key={l._id} className="p-4 rounded-xl flex items-center justify-between gap-4" style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{l.clientName}</p>
                          <Badge status={l.status} map={STATUS_BADGE} />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                          Referred by: {l.referredBy?.name} • {l.clientContact}
                        </p>
                        <p className="text-xs mt-1 italic text-stone-600">&quot;{l.projectDetails}&quot;</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickLeadStatus(l._id, "in_progress")}
                          disabled={leadActionLoading === l._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleQuickLeadStatus(l._id, "completed")}
                          disabled={leadActionLoading === l._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                  {leads.filter((l) => l.status === "pending" || l.status === "reviewed").length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>All submitted leads have been processed! ✨</p>
                  )}
                </div>
              </div>
            )}

            {/* 4. Conversion Rate Breakdown */}
            {selectedCardKey === "conversionRate" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3.5 rounded-xl" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xl font-bold font-display" style={{ color: "var(--color-text)" }}>{leads.length}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Total Leads</p>
                  </div>
                  <div className="p-3.5 rounded-xl" style={{ backgroundColor: "#D1FAE5", border: "1px solid #6EE7B7" }}>
                    <p className="text-xl font-bold font-display" style={{ color: "#065F46" }}>
                      {leads.filter((l) => l.status === "completed").length}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#065F46" }}>Completed Deals</p>
                  </div>
                  <div className="p-3.5 rounded-xl" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D" }}>
                    <p className="text-xl font-bold font-display" style={{ color: "#92400E" }}>
                      {leads.filter((l) => l.status === "pending" || l.status === "in_progress").length}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>In Pipeline</p>
                  </div>
                  <div className="p-3.5 rounded-xl" style={{ backgroundColor: "#FBEAEA", border: "1px solid #FCA5A5" }}>
                    <p className="text-xl font-bold font-display" style={{ color: "#9B2C2C" }}>
                      {leads.filter((l) => l.status === "rejected").length}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9B2C2C" }}>Rejected</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span style={{ color: "var(--color-text)" }}>Conversion Efficiency</span>
                    <span style={{ color: "var(--color-primary)" }}>{s.conversionRate ?? 0}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: "var(--color-bg)" }}>
                    <div
                      style={{
                        width: `${s.conversionRate || 0}%`,
                        backgroundColor: "#10B981",
                      }}
                      className="h-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Total Revenue Breakdown */}
            {selectedCardKey === "totalRevenue" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl text-white flex justify-between items-center" style={{ background: "linear-gradient(135deg, #1C1032 0%, #2D1B4E 100%)" }}>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-purple-200">Gross Platform Revenue</p>
                    <p className="text-3xl font-display font-bold mt-1 text-amber-400">
                      Rs. {(s.totalRevenue ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-4xl">💰</span>
                </div>
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Revenue Closed Deals Log:</p>
                <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {leads.filter((l) => l.status === "completed" && l.projectValue > 0).map((l) => (
                    <div key={l._id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-text)" }}>{l.clientName}</p>
                        <p style={{ color: "var(--color-muted)" }}>Closed by {l.referredBy?.name}</p>
                      </div>
                      <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>
                        Rs. {l.projectValue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {leads.filter((l) => l.status === "completed" && l.projectValue > 0).length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>No closed revenue deals yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* 6. Commissions Paid Breakdown */}
            {selectedCardKey === "totalCommissionsPaid" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)" }}>
                  <div>
                    <p className="text-xs uppercase font-bold text-amber-900">Total Commissions Awarded</p>
                    <p className="text-2xl font-bold font-display text-amber-900">Rs. {(s.totalCommissionsPaid ?? 0).toLocaleString()}</p>
                  </div>
                  <span className="text-3xl">🏆</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <p className="font-bold" style={{ color: "var(--color-text)" }}>Level 1 (Direct)</p>
                    <p style={{ color: "var(--color-muted)" }}>15% of deal value credited to direct referrer</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <p className="font-bold" style={{ color: "var(--color-text)" }}>Level 2 (Secondary)</p>
                    <p style={{ color: "var(--color-muted)" }}>5% of deal value credited to secondary referrer</p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Active Referrers Breakdown */}
            {selectedCardKey === "totalReferrers" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                  Top Performer Leaderboard Preview ({topReferrers.length} Referrers)
                </p>
                <div className="space-y-2">
                  {topReferrers.map((r, idx) => (
                    <div key={r.userId || idx} className="p-3 rounded-xl flex items-center justify-between text-xs" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold bg-amber-100 text-amber-900">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold" style={{ color: "var(--color-text)" }}>{r.name}</p>
                          <p style={{ color: "var(--color-muted)" }}>{r.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: "var(--color-primary)" }}>Rs. {r.totalEarned?.toLocaleString()}</p>
                        <p style={{ color: "var(--color-muted)" }}>{r.totalCommissions} commissions</p>
                      </div>
                    </div>
                  ))}
                  {topReferrers.length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>No active referrers earned commissions yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* 8. Pending Withdrawals Breakdown */}
            {selectedCardKey === "pendingWithdrawals" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                    Pending payout requests ({withdrawals.filter((w) => w.status === "requested").length})
                  </p>
                </div>
                <div className="space-y-3">
                  {withdrawals.filter((w) => w.status === "requested").map((w) => (
                    <div key={w._id} className="p-4 rounded-xl flex items-center justify-between text-xs" style={{ backgroundColor: "#FEF3C7", border: "1.5px solid #FCD34D" }}>
                      <div>
                        <p className="font-bold text-amber-900">{w.user?.name}</p>
                        <p className="text-amber-800">Rs. {w.amount?.toLocaleString()} via {w.method}</p>
                        <p className="text-[11px] text-amber-700">{w.accountInfo}</p>
                      </div>
                      <Badge status={w.status} map={WITHDRAWAL_BADGE} />
                    </div>
                  ))}
                  {withdrawals.filter((w) => w.status === "requested").length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>No pending withdrawal requests. All clear! 👍</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Users ⭐ NEW Tab & User Dashboard View ─────────────────────────────────

const UsersTab = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDashboard, setUserDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [activeUserSubTab, setActiveUserSubTab] = useState("network");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setDashboardLoading(true);
    try {
      const res = await api.get(`/users/${user._id}/dashboard`);
      setUserDashboard(res.data);
    } catch (err) {
      showToast("Failed to fetch user dashboard details", "error");
    } finally {
      setDashboardLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // If a specific user is selected, display their User Dashboard / Details view!
  if (selectedUser) {
    const d = userDashboard || {};
    const u = d.user || selectedUser;
    const fin = d.financials || {};
    const net = d.network || { level1: [], level2: [] };

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedUser(null);
              setUserDashboard(null);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-stone-200"
            style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
          >
            <span>←</span> Back to All Users
          </button>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900">
            User Dashboard View
          </span>
        </div>

        {dashboardLoading ? (
          <div className="space-y-4">
            <div className="h-32 rounded-2xl animate-pulse bg-stone-200" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* User Profile Header Card */}
            <div
              className="rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                background: "linear-gradient(135deg, #1C1032 0%, #2D1B4E 100%)",
                color: "#ffffff",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner"
                  style={{ backgroundColor: "var(--color-accent)", color: "#1D1429" }}
                >
                  {u.name ? u.name.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl">{u.name}</h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize bg-emerald-400 text-stone-900">
                      {u.status || "Active"}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize bg-amber-400 text-stone-900">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-0.5">{u.email} • {u.phone || "No contact number"}</p>
                  <p className="text-xs text-purple-300 mt-1">
                    Joined: <span className="font-semibold text-white">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                    {" • "}Referral Code: <span className="font-mono font-bold text-amber-300">{u.referralCode}</span>
                    {u.referredBy && ` • Referred by: ${u.referredBy.name} (${u.referredBy.referralCode})`}
                  </p>
                </div>
              </div>

              {/* Payment & Account Details */}
              <div className="flex flex-col gap-2 min-w-[240px]">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-xs">
                  <p className="font-semibold text-amber-300 uppercase tracking-wide text-[10px]">Account Information</p>
                  <p className="text-white mt-0.5 font-medium">Status: <span className="font-bold text-emerald-300">{u.status || "Active"}</span></p>
                  <p className="text-purple-200 text-[11px]">Registered: {u.createdAt ? new Date(u.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "—"}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-xs">
                  <p className="font-semibold text-amber-300 uppercase tracking-wide text-[10px]">Payment Details</p>
                  {u.paymentDetails?.method ? (
                    <>
                      <p className="font-bold text-white capitalize">{u.paymentDetails.method}</p>
                      <p className="text-purple-200">{u.paymentDetails.accountInfo}</p>
                    </>
                  ) : (
                    <p className="text-purple-300 italic">No payout method configured</p>
                  )}
                </div>
              </div>
            </div>

            {/* User KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Wallet Balance</p>
                <p className="text-2xl font-bold font-display mt-1" style={{ color: "var(--color-primary)" }}>
                  <CountUp value={fin.walletBalance || 0} prefix="Rs. " />
                </p>
              </div>
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Total Commissions</p>
                <p className="text-2xl font-bold font-display mt-1 text-emerald-700">
                  <CountUp value={fin.totalEarned || 0} prefix="Rs. " />
                </p>
              </div>
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Submitted Leads</p>
                <p className="text-2xl font-bold font-display mt-1" style={{ color: "var(--color-text)" }}>
                  {d.leads ? d.leads.length : 0}
                </p>
              </div>
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Network Size</p>
                <p className="text-2xl font-bold font-display mt-1 text-amber-700">
                  {net.totalNetworkCount || 0} Members
                </p>
              </div>
            </div>

            {/* Detail Tabs inside User Details */}
            <div className="rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
              <div className="px-6 py-3 flex gap-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                {[
                  { key: "network", label: `Network (${net.totalNetworkCount || 0})` },
                  { key: "leads", label: `Leads (${d.leads?.length || 0})` },
                  { key: "commissions", label: `Commissions (${d.commissions?.length || 0})` },
                  { key: "withdrawals", label: `Withdrawals (${d.withdrawals?.length || 0})` },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setActiveUserSubTab(st.key)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={
                      activeUserSubTab === st.key
                        ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                        : { backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }
                    }
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* 1. Network Subtab */}
                {activeUserSubTab === "network" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-purple-900">
                        Level 1 Direct Referrals ({net.level1.length})
                      </h4>
                      {net.level1.length === 0 ? (
                        <p className="text-xs italic" style={{ color: "var(--color-muted)" }}>No direct referrals registered yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {net.level1.map((r) => (
                            <div key={r._id} className="p-3.5 rounded-xl text-xs" style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}>
                              <p className="font-bold" style={{ color: "var(--color-text)" }}>{r.name}</p>
                              <p style={{ color: "var(--color-muted)" }}>{r.email}</p>
                              <p className="text-[11px] font-mono mt-1 text-purple-800">Code: {r.referralCode}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-amber-900">
                        Level 2 Secondary Referrals ({net.level2.length})
                      </h4>
                      {net.level2.length === 0 ? (
                        <p className="text-xs italic" style={{ color: "var(--color-muted)" }}>No secondary referrals in network.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {net.level2.map((r) => (
                            <div key={r._id} className="p-3.5 rounded-xl text-xs bg-amber-50/50" style={{ border: "1.5px solid #FCD34D" }}>
                              <p className="font-bold text-amber-950">{r.name}</p>
                              <p className="text-amber-900">{r.email}</p>
                              <p className="text-[11px] mt-1 text-amber-800">Referred by: {r.referredBy?.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Leads Subtab */}
                {activeUserSubTab === "leads" && (
                  <div className="space-y-3">
                    {d.leads?.length === 0 ? (
                      <p className="text-xs italic text-center py-6" style={{ color: "var(--color-muted)" }}>No leads submitted by this user.</p>
                    ) : (
                      d.leads?.map((l) => (
                        <div key={l._id} className="p-3.5 rounded-xl flex items-center justify-between text-xs" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                          <div>
                            <p className="font-bold" style={{ color: "var(--color-text)" }}>{l.clientName}</p>
                            <p style={{ color: "var(--color-muted)" }}>{l.clientContact} • {l.projectDetails}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                              {l.projectValue > 0 ? `Rs. ${l.projectValue.toLocaleString()}` : "No value"}
                            </span>
                            <Badge status={l.status} map={STATUS_BADGE} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. Commissions Subtab */}
                {activeUserSubTab === "commissions" && (
                  <div className="space-y-3">
                    {d.commissions?.length === 0 ? (
                      <p className="text-xs italic text-center py-6" style={{ color: "var(--color-muted)" }}>No commissions credited yet.</p>
                    ) : (
                      d.commissions?.map((c) => (
                        <div key={c._id} className="p-3.5 rounded-xl flex items-center justify-between text-xs bg-emerald-50/60" style={{ border: "1.5px solid #6EE7B7" }}>
                          <div>
                            <p className="font-bold text-emerald-950">Level {c.level} Commission ({c.level === 1 ? "15%" : "5%"})</p>
                            <p className="text-emerald-800">Client: {c.lead?.clientName || "Deal Completed"}</p>
                          </div>
                          <span className="font-bold text-sm text-emerald-700">+ Rs. {c.amount.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. Withdrawals Subtab */}
                {activeUserSubTab === "withdrawals" && (
                  <div className="space-y-3">
                    {d.withdrawals?.length === 0 ? (
                      <p className="text-xs italic text-center py-6" style={{ color: "var(--color-muted)" }}>No withdrawal requests placed.</p>
                    ) : (
                      d.withdrawals?.map((w) => (
                        <div key={w._id} className="p-3.5 rounded-xl flex items-center justify-between text-xs" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                          <div>
                            <p className="font-bold" style={{ color: "var(--color-text)" }}>Rs. {w.amount.toLocaleString()} ({w.method})</p>
                            <p style={{ color: "var(--color-muted)" }}>{w.accountInfo}</p>
                          </div>
                          <Badge status={w.status} map={WITHDRAWAL_BADGE} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  // Render All Users List View
  return (
    <div className="rounded-2xl" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
      {/* Header & Controls */}
      <div className="p-6 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
                User Management Directory
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                ⭐ NEW
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
              Inspect user profiles, network balances, and click to view full user dashboard
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              title="Refresh registered users from MongoDB"
            >
              <span>{loading ? "⌛" : "🔄"}</span>
              <span>Refresh</span>
            </button>

            {/* Search */}
            <input
              type="text"
              placeholder="Search user name, email, or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, width: "220px" }}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />

            {/* Role Filter */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}>
              {["all", "referrer", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={
                    roleFilter === r
                      ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                      : { color: "var(--color-muted)" }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl bg-stone-100" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No registered users found in database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
                  {["User Name", "Email", "Status", "Joined", "Role", "Referral Code", "Referred By", "Wallet", "Total Earned", "Leads", "Actions"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="transition-colors hover:bg-[var(--color-bg)] cursor-pointer"
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                    onClick={() => handleSelectUser(u)}
                  >
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: "var(--color-accent)", color: "#1D1429" }}
                        >
                          {u.name ? u.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-xs" style={{ color: "var(--color-text)" }}>{u.name}</p>
                          <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{u.phone || "No contact"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-xs font-medium text-stone-700">
                      {u.email}
                    </td>
                    <td className="py-3.5 pr-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                        {u.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-xs text-stone-500 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="py-3.5 pr-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-stone-100 text-stone-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-xs font-mono font-bold text-purple-900">
                      {u.referralCode || "—"}
                    </td>
                    <td className="py-3.5 pr-3 text-xs" style={{ color: "var(--color-muted)" }}>
                      {u.referredBy?.name || "—"}
                    </td>
                    <td className="py-3.5 pr-3 text-xs font-bold text-amber-700">
                      Rs. {(u.walletBalance || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-3 text-xs font-bold text-emerald-700">
                      Rs. {(u.totalEarned || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-3 text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                      {u.totalLeads || 0} ({u.completedLeads || 0} closed)
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUser(u);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-purple-900 hover:bg-purple-800 shadow-sm"
                      >
                        View Details →
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

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

const RANK_STYLES = [
  { bg: "#FEF3C7", color: "#92400E", medal: "🥇" },
  { bg: "#F1F5F9", color: "#475569", medal: "🥈" },
  { bg: "#FEF0E7", color: "#9A3412", medal: "🥉" },
];

const Leaderboard = ({ referrers, loading }) => (
  <div className="rounded-2xl" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
      <div>
        <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
          Top Referrers Leaderboard
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
          Ranked by total referral commissions earned
        </p>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(201,162,39,0.15)", color: "#AA8518" }}>
        Top Performers
      </span>
    </div>

    <div className="p-6">
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
          ))}
        </div>
      ) : referrers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <NetworkVisualSmall className="w-24 h-24 opacity-60" />
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>No commissions earned yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrers.map((r, i) => {
            const rank = RANK_STYLES[i] || null;
            return (
              <motion.div
                key={r.userId || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl px-5 py-3.5"
                style={{
                  border: `1.5px solid ${rank ? rank.bg : "var(--color-border)"}`,
                  backgroundColor: rank ? `${rank.bg}50` : "var(--color-bg)",
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: rank ? rank.bg : "var(--color-surface)",
                      color: rank ? rank.color : "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {rank ? rank.medal : `#${i + 1}`}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{r.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>{r.email} · {r.totalCommissions || 1} deals closed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-sm" style={{ color: "var(--color-primary)" }}>
                    <CountUp value={r.totalEarned} prefix="Rs. " />
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>Total Earned</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

// ─── Lead Edit Modal ──────────────────────────────────────────────────────────

const LeadEditModal = ({ lead, onClose, onSaved }) => {
  const [status, setStatus] = useState(lead.status);
  const [projectValue, setProjectValue] = useState(lead.projectValue || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await api.put(`/leads/${lead._id}`, { status, projectValue: Number(projectValue) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg" style={{ color: "var(--color-text)" }}>
            Edit Lead Status
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">✕</button>
        </div>

        <div className="p-3.5 rounded-xl mb-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Client: {lead.clientName}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
            Referred by: {lead.referredBy?.name || "Unknown"}
          </p>
        </div>

        {error && <div className="text-sm px-3 py-2 rounded-lg mb-4 bg-red-100 text-red-800">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed (Triggers Payout)</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>Project Value (Rs.)</label>
            <input
              type="number"
              value={projectValue}
              onChange={(e) => setProjectValue(e.target.value)}
              className={inputClass}
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-900 hover:bg-purple-800 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium border text-stone-600">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Leads Table Tab ─────────────────────────────────────────────────────────

const LeadsTable = ({ leads, loading, onRefresh, showToast }) => {
  const [editLead, setEditLead] = useState(null);

  return (
    <div className="rounded-2xl" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
        <div>
          <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>All Platform Leads</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Review, update status, and assign deal values</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700">{leads.length} Total</span>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="animate-pulse h-16 rounded-xl bg-stone-100" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
                  {["Referrer", "Client", "Contact", "Details", "Value", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left pb-3 pr-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-stone-50" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td className="py-3.5 pr-3 text-xs font-medium">{lead.referredBy?.name || "—"}</td>
                    <td className="py-3.5 pr-3 font-semibold">{lead.clientName}</td>
                    <td className="py-3.5 pr-3 text-xs text-stone-600">{lead.clientContact}</td>
                    <td className="py-3.5 pr-3 text-xs max-w-[180px] text-stone-600 truncate">{lead.projectDetails}</td>
                    <td className="py-3.5 pr-3 text-xs font-semibold text-purple-900">
                      {lead.projectValue > 0 ? `Rs. ${lead.projectValue.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3.5 pr-3"><Badge status={lead.status} map={STATUS_BADGE} /></td>
                    <td className="py-3.5 pr-3 text-xs text-stone-500">
                      {new Date(lead.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setEditLead(lead)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-purple-900 bg-white"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editLead && (
          <LeadEditModal
            lead={editLead}
            onClose={() => setEditLead(null)}
            onSaved={() => {
              onRefresh();
              showToast("Lead updated successfully!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Withdrawals Table Tab ───────────────────────────────────────────────────

const WITHDRAWAL_TABS = ["all", "requested", "approved", "rejected", "paid"];

const WithdrawalsTable = ({ withdrawals, loading, onRefresh, showToast }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [processing, setProcessing] = useState(null);

  const filtered = activeTab === "all" ? withdrawals : withdrawals.filter((w) => w.status === activeTab);

  const updateStatus = async (id, status) => {
    setProcessing(id + status);
    try {
      await api.put(`/withdrawals/${id}`, { status });
      onRefresh();
      showToast(status === "rejected" ? "Withdrawal rejected." : `Withdrawal marked as ${status}.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="rounded-2xl" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-display font-semibold text-base mb-3" style={{ color: "var(--color-text)" }}>Withdrawal Requests</h2>
        <div className="flex gap-2 flex-wrap">
          {WITHDRAWAL_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
              style={
                activeTab === t
                  ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                  : { backgroundColor: "var(--color-bg)", color: "var(--color-muted)", border: "1.5px solid var(--color-border)" }
              }
            >
              {t} ({t === "all" ? withdrawals.length : withdrawals.filter((w) => w.status === t).length})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map((w) => (
          <div key={w._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-5 py-3.5" style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold">{w.user?.name}</p>
                <Badge status={w.status} map={WITHDRAWAL_BADGE} />
              </div>
              <p className="text-xs text-stone-600">
                <span className="font-semibold text-emerald-800">Rs. {w.amount.toLocaleString()}</span> · {w.method} · {w.accountInfo}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {w.status === "requested" && (
                <>
                  <button
                    onClick={() => updateStatus(w._id, "approved")}
                    disabled={processing === w._id + "approved"}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(w._id, "rejected")}
                    disabled={processing === w._id + "rejected"}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              {w.status === "approved" && (
                <button
                  onClick={() => updateStatus(w._id, "paid")}
                  disabled={processing === w._id + "paid"}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-purple-900 disabled:opacity-50"
                >
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Admin Component ─────────────────────────────────────────────────────

const TABS = [
  { key: "analytics", label: "Analytics", icon: "📊" },
  { key: "leads", label: "Leads", icon: "📋" },
  { key: "withdrawals", label: "Withdrawals", icon: "🏦" },
  { key: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { key: "users", label: "Users", icon: "👤", badge: "⭐ NEW" },
  { key: "messages", label: "Messages", icon: "💬" },
];

const Admin = () => {
  const [tab, setTab] = useState("analytics");
  const [leads, setLeads] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, withdrawalsRes, summaryRes, topRes] = await Promise.all([
        api.get("/leads"),
        api.get("/withdrawals"),
        api.get("/analytics/summary"),
        api.get("/analytics/top-referrers"),
      ]);
      setLeads(leadsRes.data);
      setWithdrawals(withdrawalsRes.data);
      setSummary(summaryRes.data);
      setTopReferrers(topRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <Layout>
      <AnimatePresence>
        {toast.msg && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto px-4 md:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--color-text)" }}>
            Admin Panel
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Manage platform leads, process payouts, inspect network metrics, and manage users
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <motion.button
              key={t.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
              style={
                tab === t.key
                  ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                  : {
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-muted)",
                      border: "1.5px solid var(--color-border)",
                    }
              }
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-900">
                  {t.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {tab === "analytics" && (
              <SummaryCards
                summary={summary}
                loading={loading}
                leads={leads}
                withdrawals={withdrawals}
                topReferrers={topReferrers}
                onRefresh={fetchAll}
                showToast={showToast}
              />
            )}
            {tab === "leads" && (
              <LeadsTable
                leads={leads}
                loading={loading}
                onRefresh={fetchAll}
                showToast={showToast}
              />
            )}
            {tab === "withdrawals" && (
              <WithdrawalsTable
                withdrawals={withdrawals}
                loading={loading}
                onRefresh={fetchAll}
                showToast={showToast}
              />
            )}
            {tab === "leaderboard" && (
              <Leaderboard referrers={topReferrers} loading={loading} />
            )}
            {tab === "users" && (
              <UsersTab showToast={showToast} />
            )}
            {tab === "messages" && (
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <Messages />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default Admin;
