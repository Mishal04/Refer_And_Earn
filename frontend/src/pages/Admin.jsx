import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Layout from "../components/Layout";

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
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const Toast = ({ msg, type = "success" }) =>
  msg ? (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
      style={
        type === "success"
          ? { backgroundColor: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7" }
          : { backgroundColor: "#FBEAEA", color: "#9B2C2C", border: "1px solid #FCA5A5" }
      }
    >
      {msg}
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

// ─── Summary Cards ───────────────────────────────────────────────────────────

const SummaryCards = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!summary) return null;

  const cards = [
    { label: "Total Leads", value: summary.totalLeads, icon: "📋", accent: false },
    { label: "Completed", value: summary.completedCount, icon: "✅", accent: false },
    { label: "Pending", value: summary.pendingCount, icon: "⏳", accent: false },
    { label: "Conversion Rate", value: `${summary.conversionRate}%`, icon: "📈", accent: true },
    { label: "Total Revenue", value: `Rs. ${(summary.totalRevenue || 0).toLocaleString()}`, icon: "💰", accent: true },
    { label: "Commissions Paid", value: `Rs. ${(summary.totalCommissionsPaid || 0).toLocaleString()}`, icon: "🏆", accent: false },
    { label: "Active Referrers", value: summary.referrerCount, icon: "👥", accent: false },
    { label: "Pending Withdrawals", value: summary.pendingWithdrawalsCount, icon: "🏦", accent: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          {...fadeUp(i * 0.06)}
          className="rounded-2xl p-5"
          style={{
            backgroundColor: c.accent ? "var(--color-primary)" : "var(--color-surface)",
            border: c.accent ? "none" : "1.5px solid var(--color-border)",
          }}
        >
          <p className="text-lg mb-1">{c.icon}</p>
          <p
            className="text-xl font-display font-bold"
            style={{ color: c.accent ? "#D9A441" : "var(--color-text)" }}
          >
            {c.value}
          </p>
          <p
            className="text-xs font-medium mt-0.5"
            style={{ color: c.accent ? "rgba(255,255,255,0.6)" : "var(--color-muted)" }}
          >
            {c.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

const RANK_STYLES = [
  { bg: "#FEF3C7", color: "#92400E", glow: "rgba(217,164,65,0.3)", medal: "🥇" },
  { bg: "#F1F5F9", color: "#475569", glow: "rgba(148,163,184,0.3)", medal: "🥈" },
  { bg: "#FEF0E7", color: "#9A3412", glow: "rgba(234,88,12,0.2)", medal: "🥉" },
];

const Leaderboard = ({ referrers, loading }) => (
  <div
    className="rounded-2xl"
    style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
  >
    <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
      <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
        Top Referrers
      </h2>
    </div>
    <div className="p-6">
      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => (
          <div key={i} className="animate-pulse h-14 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
        ))}</div>
      ) : referrers.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--color-muted)" }}>
          No commissions earned yet.
        </p>
      ) : (
        <div className="space-y-3">
          {referrers.map((r, i) => {
            const rank = RANK_STYLES[i] || null;
            return (
              <motion.div
                key={r.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  border: `1.5px solid ${rank ? rank.bg : "var(--color-border)"}`,
                  backgroundColor: rank ? `${rank.bg}60` : "transparent",
                  boxShadow: rank ? `0 0 12px ${rank.glow}` : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">
                    {rank ? rank.medal : `#${i + 1}`}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {r.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>{r.email}</p>
                  </div>
                </div>
                <p className="font-display font-bold text-sm" style={{ color: "var(--color-primary)" }}>
                  Rs. {r.totalEarned.toLocaleString()}
                </p>
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
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--color-text)" }}>
          Edit Lead
        </h3>
        <p className="text-sm mb-5" style={{ color: "var(--color-muted)" }}>
          {lead.clientName} · {lead.referredBy?.name}
        </p>

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
              className={inputClass} style={inputStyle}
              onFocus={inputFocus} onBlur={inputBlur}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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
              className={inputClass} style={inputStyle}
              onFocus={inputFocus} onBlur={inputBlur}
              placeholder="0"
            />
          </div>

          {status === "completed" && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
              ⚠️ Setting status to &quot;completed&quot; with a project value triggers commission calculation automatically — this only fires once.
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {loading ? "Saving…" : "Save Changes"}
          </motion.button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-muted)" }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Leads Table ─────────────────────────────────────────────────────────────

const LeadsTable = ({ leads, loading, onRefresh, showToast }) => {
  const [editLead, setEditLead] = useState(null);

  return (
    <div
      className="rounded-2xl"
      style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    >
      <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
        <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
          All Leads
        </h2>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">{[0,1,2,3].map(i => (
            <div key={i} className="animate-pulse h-16 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
          ))}</div>
        ) : leads.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-muted)" }}>No leads yet.</p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
                    {["Referrer", "Client", "Contact", "Details", "Value", "Status", "Date", ""].map(h => (
                      <th key={h} className="text-left pb-3 pr-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <td className="py-3 pr-3 text-xs" style={{ color: "var(--color-muted)" }}>
                        {lead.referredBy?.name || "—"}
                      </td>
                      <td className="py-3 pr-3 font-medium" style={{ color: "var(--color-text)" }}>
                        {lead.clientName}
                      </td>
                      <td className="py-3 pr-3 text-xs" style={{ color: "var(--color-muted)" }}>
                        {lead.clientContact}
                      </td>
                      <td className="py-3 pr-3 text-xs max-w-[180px]" style={{ color: "var(--color-muted)" }}>
                        <span className="line-clamp-2">{lead.projectDetails}</span>
                      </td>
                      <td className="py-3 pr-3 text-xs font-medium" style={{ color: "var(--color-text)" }}>
                        {lead.projectValue > 0 ? `Rs. ${lead.projectValue.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge status={lead.status} map={STATUS_BADGE} />
                      </td>
                      <td className="py-3 pr-3 text-xs" style={{ color: "var(--color-muted)" }}>
                        {new Date(lead.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditLead(lead)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "var(--color-bg)", color: "var(--color-primary)", border: "1.5px solid var(--color-border)" }}
                        >
                          Edit
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked */}
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
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{lead.clientName}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>by {lead.referredBy?.name}</p>
                    </div>
                    <Badge status={lead.status} map={STATUS_BADGE} />
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--color-muted)" }}>{lead.projectDetails}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                      {lead.projectValue > 0 ? `Rs. ${lead.projectValue.toLocaleString()}` : "No value set"}
                    </span>
                    <button
                      onClick={() => setEditLead(lead)}
                      className="text-xs font-medium px-3 py-1 rounded-lg"
                      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-primary)", border: "1.5px solid var(--color-border)" }}
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

// ─── Withdrawals Table ────────────────────────────────────────────────────────

const WITHDRAWAL_TABS = ["all", "requested", "approved", "rejected", "paid"];

const WithdrawalsTable = ({ withdrawals, loading, onRefresh, showToast }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [processing, setProcessing] = useState(null);

  const filtered = activeTab === "all"
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
          All Withdrawals
        </h2>
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {WITHDRAWAL_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={
                activeTab === t
                  ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                  : { backgroundColor: "var(--color-bg)", color: "var(--color-muted)", border: "1.5px solid var(--color-border)" }
              }
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">{[0,1,2].map(i => (
            <div key={i} className="animate-pulse h-16 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }} />
          ))}</div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-muted)" }}>
            No {activeTab === "all" ? "" : activeTab} withdrawals.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((w, i) => (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ border: "1.5px solid var(--color-border)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {w.user?.name}
                    </p>
                    <Badge status={w.status} map={WITHDRAWAL_BADGE} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    Rs. {w.amount.toLocaleString()} · {w.method} · {w.accountInfo}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-border)" }}>
                    {new Date(w.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
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
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                        style={{ backgroundColor: "#065F46" }}
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => updateStatus(w._id, "rejected")}
                        disabled={processing === w._id + "rejected"}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
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
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
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

// ─── Main Admin ───────────────────────────────────────────────────────────────

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
            Manage leads, withdrawals, and view analytics
          </p>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          {...fadeUp(0.05)}
          className="flex gap-2 mb-6 flex-wrap"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
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
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
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
