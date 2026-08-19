import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Layout from "../components/Layout";
import CountUp from "../components/CountUp";
import NetworkVisualSmall from "../components/NetworkVisualSmall";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut", delay },
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
      transition={{ duration: 0.2 }}
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

const inputClass =
  "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white";
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

// ─── Summary Cards (Analytics Tab) ────────────────────────────────────────────

const SummaryCards = ({ summary, loading }) => {
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
    { label: "Total Leads", value: s.totalLeads ?? 0, icon: "📋", accent: false },
    { label: "Completed", value: s.completedLeads ?? 0, icon: "✅", accent: false },
    { label: "Pending", value: s.pendingLeads ?? 0, icon: "⏳", accent: false },
    {
      label: "Conversion Rate",
      value: s.conversionRate ?? 0,
      icon: "📈",
      accent: true,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Total Revenue",
      value: s.totalRevenue ?? 0,
      icon: "💰",
      accent: true,
      prefix: "Rs. ",
    },
    {
      label: "Commissions Paid",
      value: s.totalCommissionsPaid ?? 0,
      icon: "🏆",
      accent: false,
      prefix: "Rs. ",
    },
    { label: "Active Referrers", value: s.totalReferrers ?? 0, icon: "👥", accent: false },
    { label: "Pending Withdrawals", value: s.pendingWithdrawals ?? 0, icon: "🏦", accent: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          {...fadeUp(i * 0.05)}
          whileHover={{
            y: -4,
            boxShadow: "0 12px 24px -12px rgba(10,59,50,0.18)",
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="rounded-2xl p-5 cursor-default transition-shadow"
          style={{
            backgroundColor: c.accent ? "var(--color-primary)" : "var(--color-surface)",
            border: c.accent ? "none" : "1.5px solid var(--color-border)",
            background: c.accent
              ? "linear-gradient(135deg, #0A3B32 0%, #0E4F43 70%, #123F35 100%)"
              : "var(--color-surface)",
          }}
        >
          <p className="text-xl mb-1.5">{c.icon}</p>
          <p
            className="text-2xl font-display font-bold tracking-tight"
            style={{ color: c.accent ? "#D9A441" : "var(--color-text)" }}
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
              color: c.accent ? "rgba(255,255,255,0.7)" : "var(--color-muted)",
            }}
          >
            {c.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

const RANK_STYLES = [
  { bg: "#FEF3C7", color: "#92400E", medal: "🥇", label: "Top Earner" },
  { bg: "#F1F5F9", color: "#475569", medal: "🥈", label: "Rank 2" },
  { bg: "#FEF0E7", color: "#9A3412", medal: "🥉", label: "Rank 3" },
];

const Leaderboard = ({ referrers, loading }) => (
  <div
    className="rounded-2xl"
    style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
  >
    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
      <div>
        <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
          Top Referrers Leaderboard
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
          Ranked by total referral commissions earned
        </p>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(217,164,65,0.15)", color: "#9B701F" }}>
        Top 10 Performers
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
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            No commissions earned yet
          </p>
          <p className="text-xs max-w-sm" style={{ color: "var(--color-muted)" }}>
            The leaderboard will automatically populate once referrers convert leads into completed deals.
          </p>
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
                whileHover={{
                  y: -2,
                  boxShadow: "0 8px 16px -8px rgba(10,59,50,0.15)",
                }}
                className="flex items-center justify-between rounded-xl px-5 py-3.5 transition-all"
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
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {r.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {r.email} · {r.totalCommissions || 1} deals closed
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-display font-bold text-sm" style={{ color: "var(--color-primary)" }}>
                    <CountUp value={r.totalEarned} prefix="Rs. " />
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                    Total Earned
                  </p>
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
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg" style={{ color: "var(--color-text)" }}>
            Edit Lead Status
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-3.5 rounded-xl mb-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
            Client: {lead.clientName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
            Referred by: {lead.referredBy?.name || "Unknown"} ({lead.referredBy?.email})
          </p>
        </div>

        {error && (
          <div className="text-sm px-3 py-2 rounded-lg mb-4" style={{ backgroundColor: "#FBEAEA", color: "#9B2C2C" }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
              Status
            </label>
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
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
              Project Value (Rs.)
            </label>
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

          {status === "completed" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs rounded-xl p-3.5 leading-relaxed"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FCD34D",
              }}
            >
              ⚠️ <strong>Commission Credit Notice:</strong> Marking this lead as &quot;Completed&quot; with a project value will automatically credit the 15% Level 1 and 5% Level 2 commission to the referrers&apos; wallets.
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 shadow-sm"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {loading ? "Saving…" : "Save Changes"}
          </motion.button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-stone-100"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-muted)" }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Leads Table Tab ─────────────────────────────────────────────────────────

const LeadsTable = ({ leads, loading, onRefresh, showToast }) => {
  const [editLead, setEditLead] = useState(null);

  return (
    <div
      className="rounded-2xl"
      style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    >
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
        <div>
          <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
            All Platform Leads
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
            Review, update status, and assign deal values to calculate commissions
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }}>
          {leads.length} Total
        </span>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No leads submitted yet.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
                    {["Referrer", "Client", "Contact", "Details", "Value", "Status", "Date", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left pb-3 pr-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition-colors hover:bg-[var(--color-bg)]"
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <td className="py-3.5 pr-3 text-xs font-medium" style={{ color: "var(--color-text)" }}>
                        {lead.referredBy?.name || "—"}
                      </td>
                      <td className="py-3.5 pr-3 font-semibold" style={{ color: "var(--color-text)" }}>
                        {lead.clientName}
                      </td>
                      <td className="py-3.5 pr-3 text-xs" style={{ color: "var(--color-muted)" }}>
                        {lead.clientContact}
                      </td>
                      <td className="py-3.5 pr-3 text-xs max-w-[180px]" style={{ color: "var(--color-muted)" }}>
                        <span className="line-clamp-2">{lead.projectDetails}</span>
                      </td>
                      <td className="py-3.5 pr-3 text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                        {lead.projectValue > 0 ? `Rs. ${lead.projectValue.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 pr-3">
                        <Badge status={lead.status} map={STATUS_BADGE} />
                      </td>
                      <td className="py-3.5 pr-3 text-xs" style={{ color: "var(--color-muted)" }}>
                        {new Date(lead.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditLead(lead)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          style={{
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-primary)",
                            border: "1.5px solid var(--color-border)",
                          }}
                        >
                          Edit
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {leads.map((lead, i) => (
                <motion.div
                  key={lead._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-4"
                  style={{ border: "1.5px solid var(--color-border)" }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        {lead.clientName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        by {lead.referredBy?.name}
                      </p>
                    </div>
                    <Badge status={lead.status} map={STATUS_BADGE} />
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--color-muted)" }}>
                    {lead.projectDetails}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                      {lead.projectValue > 0 ? `Rs. ${lead.projectValue.toLocaleString()}` : "No value set"}
                    </span>
                    <button
                      onClick={() => setEditLead(lead)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-primary)",
                        border: "1.5px solid var(--color-border)",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
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

  const filtered =
    activeTab === "all"
      ? withdrawals
      : withdrawals.filter((w) => w.status === activeTab);

  const updateStatus = async (id, status) => {
    setProcessing(id + status);
    try {
      await api.put(`/withdrawals/${id}`, { status });
      onRefresh();
      showToast(
        status === "rejected"
          ? "Withdrawal rejected. Amount refunded to referrer's wallet."
          : `Withdrawal marked as ${status}.`
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div
      className="rounded-2xl"
      style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    >
      <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
        <h2 className="font-display font-semibold text-base mb-3" style={{ color: "var(--color-text)" }}>
          Withdrawal Requests
        </h2>
        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {WITHDRAWAL_TABS.map((t) => {
            const count =
              t === "all"
                ? withdrawals.length
                : withdrawals.filter((w) => w.status === t).length;

            return (
              <motion.button
                key={t}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(t)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                style={
                  activeTab === t
                    ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                    : {
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-muted)",
                        border: "1.5px solid var(--color-border)",
                      }
                }
              >
                <span>{t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded-full"
                  style={{
                    backgroundColor: activeTab === t ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
                  }}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No {activeTab === "all" ? "" : activeTab} withdrawal requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((w, i) => (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{
                  y: -2,
                  boxShadow: "0 8px 16px -8px rgba(10,59,50,0.12)",
                }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-5 py-3.5 transition-all"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1.5px solid var(--color-border)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {w.user?.name}
                    </p>
                    <Badge status={w.status} map={WITHDRAWAL_BADGE} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    <span className="font-semibold text-emerald-800">Rs. {w.amount.toLocaleString()}</span> · {w.method} · {w.accountInfo}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted)" }}>
                    Requested: {new Date(w.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {w.status === "requested" && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => updateStatus(w._id, "approved")}
                        disabled={processing === w._id + "approved"}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 shadow-sm"
                        style={{ backgroundColor: "#065F46" }}
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => updateStatus(w._id, "rejected")}
                        disabled={processing === w._id + "rejected"}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 shadow-sm"
                        style={{ backgroundColor: "#9B2C2C" }}
                      >
                        Reject
                      </motion.button>
                    </>
                  )}
                  {w.status === "approved" && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => updateStatus(w._id, "paid")}
                      disabled={processing === w._id + "paid"}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 shadow-sm"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      Mark Paid
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab Navigation ───────────────────────────────────────────────────────────

const TABS = [
  { key: "analytics", label: "Analytics", icon: "📊" },
  { key: "leads", label: "Leads", icon: "📋" },
  { key: "withdrawals", label: "Withdrawals", icon: "🏦" },
  { key: "leaderboard", label: "Leaderboard", icon: "🏆" },
];

// ─── Main Admin Component ─────────────────────────────────────────────────────

const Admin = () => {
  const [tab, setTab] = useState("analytics");
  const [leads, setLeads] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

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
        <motion.div {...fadeUp(0)} className="mb-6">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--color-text)" }}>
            Admin Panel
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Manage platform leads, process payouts, and inspect network metrics
          </p>
        </motion.div>

        {/* Tab Bar */}
        <motion.div {...fadeUp(0.05)} className="flex gap-2 mb-6 flex-wrap">
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
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content with Animated Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {tab === "analytics" && (
              <SummaryCards summary={summary} loading={loading} />
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
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default Admin;
