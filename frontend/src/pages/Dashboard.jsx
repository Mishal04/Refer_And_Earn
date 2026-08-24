import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Layout from "../components/Layout";
import NetworkVisualSmall from "../components/NetworkVisualSmall";
import DisclaimerBox from "../components/DisclaimerBox";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut", delay },
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

// ─── Professional SVG Icons ──────────────────────────────────────────────────

const IconLeads = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </svg>
);

const IconCheckCircle = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconClock = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconCreditCard = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconBank = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 22 7 12 2" />
    <line x1="2" y1="17" x2="22" y2="17" />
    <line x1="2" y1="21" x2="22" y2="21" />
    <line x1="5" y1="7" x2="5" y2="17" />
    <line x1="10" y1="7" x2="10" y2="17" />
    <line x1="15" y1="7" x2="15" y2="17" />
    <line x1="19" y1="7" x2="19" y2="17" />
  </svg>
);

const IconWallet = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
);

const PAYMENT_METHODS = {
  easypaisa: { label: "Easypaisa", icon: <IconCreditCard className="w-4 h-4 text-purple-900" /> },
  jazzcash:  { label: "JazzCash", icon: <IconCreditCard className="w-4 h-4 text-amber-700" /> },
  bank:      { label: "Bank Transfer", icon: <IconBank className="w-4 h-4 text-blue-700" /> },
};

const maskAccountInfo = (info) => {
  if (!info) return "";
  const trimmed = info.trim();
  if (trimmed.length <= 4) return trimmed;
  return `•••• •••• ${trimmed.slice(-4)}`;
};

const Badge = ({ status, map }) => {
  const s = map[status] || { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const ErrorBox = ({ msg }) =>
  msg ? (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-sm px-3 py-2 rounded-lg mb-4"
      style={{ backgroundColor: "#FBEAEA", color: "#9B2C2C" }}
    >
      {msg}
    </motion.div>
  ) : null;

const SuccessBox = ({ msg }) =>
  msg ? (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-sm px-3 py-2 rounded-lg mb-4"
      style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
    >
      {msg}
    </motion.div>
  ) : null;

const inputClass =
  "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white";
const inputStyle = { border: "1.5px solid var(--color-border)" };
const inputFocus = (e) => (e.target.style.borderColor = "var(--color-primary)");
const inputBlur = (e) => (e.target.style.borderColor = "var(--color-border)");

const SkeletonCard = () => (
  <div
    className="rounded-2xl p-6 animate-pulse"
    style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
  >
    <div className="h-3 w-24 rounded mb-3" style={{ backgroundColor: "var(--color-border)" }} />
    <div className="h-8 w-16 rounded" style={{ backgroundColor: "var(--color-border)" }} />
  </div>
);

import CountUp from "../components/CountUp";

// ─── Section: Stat Cards ────────────────────────────────────────────────────

const StatsRow = ({ leads, loading }) => {
  const total = leads.length;
  const pending = leads.filter((l) => l.status === "pending").length;
  const completed = leads.filter((l) => l.status === "completed").length;

  const stats = [
    { label: "Total Leads", value: total, icon: <IconLeads className="w-5 h-5" />, bg: "bg-purple-100", color: "text-purple-900" },
    { label: "Pending", value: pending, icon: <IconClock className="w-5 h-5" />, bg: "bg-amber-100", color: "text-amber-900" },
    { label: "Completed", value: completed, icon: <IconCheckCircle className="w-5 h-5" />, bg: "bg-emerald-100", color: "text-emerald-900" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {loading
        ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
        : stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i * 0.07)}
              whileHover={{ y: -4, boxShadow: "0 12px 24px -12px rgba(10,59,50,0.18)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-2xl p-5 cursor-default"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-2xl font-display font-bold" style={{ color: "var(--color-text)" }}>
                <CountUp value={s.value} />
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: "var(--color-muted)" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
    </div>
  );
};

// ─── Section: Payment Details Card ──────────────────────────────────────────

const PaymentDetailsCard = ({ paymentDetails, onSaveSuccess, cardRef, open, onOpenChange }) => {
  const [form, setForm] = useState({
    method: paymentDetails?.method || "easypaisa",
    accountInfo: paymentDetails?.accountInfo || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (paymentDetails) {
      setForm({
        method: paymentDetails.method || "easypaisa",
        accountInfo: paymentDetails.accountInfo || "",
      });
    }
  }, [paymentDetails]);

  const hasDetails = Boolean(paymentDetails?.method && paymentDetails?.accountInfo);
  const currentMethodMeta = PAYMENT_METHODS[paymentDetails?.method] || { label: "Not set", icon: <IconCreditCard className="w-4 h-4" /> };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.put("/auth/payment-details", form);
      setSuccess("Payment details saved successfully!");
      if (onSaveSuccess) onSaveSuccess(res.data.paymentDetails);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="rounded-2xl mb-6 overflow-hidden scroll-mt-24"
      style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1.5px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: "rgba(217,164,65,0.15)", color: "#9B701F" }}
          >
            <IconWallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
              Payment Details
            </h2>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Your default payout destination for rapid withdrawals
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOpenChange(!open)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={
            open
              ? { backgroundColor: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)" }
              : { backgroundColor: "var(--color-primary)", color: "#fff" }
          }
        >
          {open ? "Cancel" : hasDetails ? "Edit Method" : "+ Add Method"}
        </motion.button>
      </div>

      {/* Body / Saved State */}
      <div className="p-6">
        {!open && (
          <div>
            {hasDetails ? (
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}>
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    {currentMethodMeta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        {currentMethodMeta.label}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Default Payout
                      </span>
                    </div>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-muted)" }}>
                      {maskAccountInfo(paymentDetails.accountInfo)}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onOpenChange(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  Change
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl" style={{ backgroundColor: "var(--color-bg)", border: "1.5px dashed var(--color-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-800">
                    <IconCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      No payout method added yet
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      Save your account info once so requesting withdrawals is seamless.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenChange(true)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-white whitespace-nowrap"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  + Add Payment Method
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Edit Form */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}
              >
                <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--color-text)" }}>
                  {hasDetails ? "Update Payout Details" : "Add Payout Details"}
                </h3>

                <ErrorBox msg={error} />
                <SuccessBox msg={success} />

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                        Payout Method
                      </label>
                      <select
                        value={form.method}
                        onChange={(e) => setForm({ ...form, method: e.target.value })}
                        className={inputClass}
                        style={{ ...inputStyle, backgroundColor: "var(--color-surface)" }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      >
                        <option value="easypaisa">Easypaisa</option>
                        <option value="jazzcash">JazzCash</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                        Account Info (Number or IBAN)
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. 03001234567 or PK36MEZN..."
                        value={form.accountInfo}
                        onChange={(e) => setForm({ ...form, accountInfo: e.target.value })}
                        className={inputClass}
                        style={{ ...inputStyle, backgroundColor: "var(--color-surface)" }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      type="submit"
                      disabled={saving || !form.accountInfo.trim()}
                      className="text-white py-2.5 px-6 rounded-lg font-semibold text-sm disabled:opacity-50"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {saving ? "Saving…" : "Save Payment Details"}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="text-xs font-semibold px-4 py-2.5 rounded-lg border hover:bg-white transition-colors"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Section: Lead Form ─────────────────────────────────────────────────────

const LeadForm = ({ onSuccess, open, onOpenChange, formRef }) => {
  const [form, setForm] = useState({ clientName: "", clientContact: "", projectDetails: "", source: "whatsapp" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/leads", form);
      setSuccess("Lead submitted successfully!");
      setForm({ clientName: "", clientContact: "", projectDetails: "", source: "whatsapp" });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={formRef}
      className="rounded-2xl mb-6 overflow-hidden scroll-mt-24"
      style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    >
      <button
        onClick={() => onOpenChange(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
            Submit New Lead
          </span>
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0">
              <div className="mb-4" style={{ borderTop: "1px solid var(--color-border)" }} />
              <ErrorBox msg={error} />
              <SuccessBox msg={success} />
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                      Client Name
                    </label>
                    <input
                      required
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      className={inputClass} style={inputStyle}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                      Client Contact
                    </label>
                    <input
                      required
                      value={form.clientContact}
                      onChange={(e) => setForm({ ...form, clientContact: e.target.value })}
                      className={inputClass} style={inputStyle}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                    Project Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.projectDetails}
                    onChange={(e) => setForm({ ...form, projectDetails: e.target.value })}
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                    Source
                  </label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="text-white py-2.5 px-6 rounded-lg font-semibold text-sm disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {loading ? "Submitting…" : "Submit Lead"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Section: My Leads ──────────────────────────────────────────────────────

const LeadsTable = ({ leads, loading, onAddLead }) => (
  <div
    className="rounded-2xl mb-6"
    style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
  >
    <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
      <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
        My Leads
      </h2>
    </div>
    <div className="p-6">
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl h-16" style={{ backgroundColor: "var(--color-bg)" }} />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-10 gap-4"
        >
          <NetworkVisualSmall className="w-28 h-28" />
          <p className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
            No leads yet. Submit your first lead to get started!
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddLead}
            className="text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Submit Your First Lead
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
                  {["Client", "Contact", "Source", "Project Value", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-3 pr-4 text-xs font-semibold uppercase tracking-wide"
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="transition-colors hover:bg-[var(--color-bg)]"
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td className="py-3 pr-4 font-medium" style={{ color: "var(--color-text)" }}>
                      {lead.clientName}
                    </td>
                    <td className="py-3 pr-4" style={{ color: "var(--color-muted)" }}>
                      {lead.clientContact}
                    </td>
                    <td className="py-3 pr-4 capitalize" style={{ color: "var(--color-muted)" }}>
                      {lead.source || "—"}
                    </td>
                    <td className="py-3 pr-4 font-medium" style={{ color: "var(--color-text)" }}>
                      {lead.projectValue > 0 ? `Rs. ${lead.projectValue.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge status={lead.status} map={STATUS_BADGE} />
                    </td>
                    <td className="py-3" style={{ color: "var(--color-muted)" }}>
                      {new Date(lead.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {leads.map((lead, i) => (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-4"
                style={{ border: "1.5px solid var(--color-border)" }}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {lead.clientName}
                  </p>
                  <Badge status={lead.status} map={STATUS_BADGE} />
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--color-muted)" }}>{lead.clientContact}</p>
                <p className="text-xs capitalize mb-1" style={{ color: "var(--color-muted)" }}>
                  via {lead.source || "—"}
                </p>
                {lead.projectValue > 0 && (
                  <p className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                    Rs. {lead.projectValue.toLocaleString()}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--color-border)" }}>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

// ─── Section: Withdrawals ───────────────────────────────────────────────────

const WithdrawalsPanel = ({ walletBalance, onBalanceUpdate, paymentDetails, onOpenPaymentDetails }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    method: paymentDetails?.method || "easypaisa",
    accountInfo: paymentDetails?.accountInfo || "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);

  // Sync form defaults with saved payment details
  useEffect(() => {
    if (paymentDetails?.method && paymentDetails?.accountInfo) {
      setForm((prev) => ({
        ...prev,
        method: paymentDetails.method,
        accountInfo: paymentDetails.accountInfo,
      }));
    }
  }, [paymentDetails]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await api.get("/withdrawals/mine");
      setWithdrawals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const handleOpenForm = () => {
    // If opening form, ensure prefilled values from paymentDetails are active
    if (!open && paymentDetails?.method && paymentDetails?.accountInfo) {
      setForm((prev) => ({
        ...prev,
        method: paymentDetails.method,
        accountInfo: paymentDetails.accountInfo,
      }));
    }
    setOpen(!open);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/withdrawals", form);
      setSuccess("Withdrawal requested! Your wallet balance has been updated.");
      setForm({
        amount: "",
        method: paymentDetails?.method || "easypaisa",
        accountInfo: paymentDetails?.accountInfo || "",
      });
      setOpen(false);
      fetchWithdrawals();
      onBalanceUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request withdrawal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-2xl mb-6"
      style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    >
      <div className="px-6 py-4" style={{ borderBottom: "1.5px solid var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-base" style={{ color: "var(--color-text)" }}>
            Withdrawals
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenForm}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {open ? "Cancel" : "+ Request"}
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-5"
            >
              <div
                className="rounded-xl p-5 mb-1"
                style={{ backgroundColor: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    Request Withdrawal
                  </h3>
                  {paymentDetails?.accountInfo ? (
                    <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Prefilled with saved wallet
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenPaymentDetails}
                      className="text-[11px] font-semibold text-[#9B701F] hover:underline"
                    >
                      Save payout info for faster requests →
                    </button>
                  )}
                </div>

                <ErrorBox msg={error} />
                <SuccessBox msg={success} />

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                        Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 5000"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--color-surface)" }}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                        Method
                      </label>
                      <select
                        value={form.method}
                        onChange={(e) => setForm({ ...form, method: e.target.value })}
                        className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--color-surface)" }}
                        onFocus={inputFocus} onBlur={inputBlur}
                      >
                        <option value="easypaisa">Easypaisa</option>
                        <option value="jazzcash">JazzCash</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                      Account Info (number / IBAN)
                    </label>
                    <input
                      required
                      value={form.accountInfo}
                      onChange={(e) => setForm({ ...form, accountInfo: e.target.value })}
                      className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--color-surface)" }}
                      onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={submitting}
                    className="text-white py-2.5 px-6 rounded-lg font-semibold text-sm disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {submitting ? "Requesting…" : "Request Withdrawal"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded-xl h-14" style={{ backgroundColor: "var(--color-bg)" }} />
            ))}
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--color-muted)" }}>
            No withdrawal requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w, i) => (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, backgroundColor: "var(--color-bg)" }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{ border: "1.5px solid var(--color-border)" }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    Rs. {w.amount.toLocaleString()}
                  </p>
                  <p className="text-xs capitalize" style={{ color: "var(--color-muted)" }}>
                    {w.method} · {w.accountInfo}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={w.status} map={WITHDRAWAL_BADGE} />
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {new Date(w.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance ?? 0);
  const [paymentDetails, setPaymentDetails] = useState(user?.paymentDetails ?? null);
  const [copied, setCopied] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [paymentCardOpen, setPaymentCardOpen] = useState(false);
  const leadFormRef = useRef(null);
  const paymentCardRef = useRef(null);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await api.get("/leads/mine");
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setWalletBalance(res.data.walletBalance ?? 0);
      if (res.data.paymentDetails) {
        setPaymentDetails(res.data.paymentDetails);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchMe();
  }, [fetchLeads, fetchMe]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLeadForm = () => {
    setLeadFormOpen(true);
    setTimeout(() => {
      leadFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const openPaymentCard = () => {
    setPaymentCardOpen(true);
    setTimeout(() => {
      paymentCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-4xl mx-auto px-4 md:px-8 py-8"
      >
        {/* Hero strip */}
        <motion.div
          {...fadeUp(0)}
          className="rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1C1032 0%, #2D1B4E 60%, #22143D 100%)",
          }}
        >
          {/* Decorative network visual */}
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20 pointer-events-none">
            <NetworkVisualSmall className="w-full h-full" dark />
          </div>

          <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Welcome back,
          </p>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-6">
            {user?.name} 👋
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wallet balance */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                Wallet Balance
              </p>
              <p className="font-display font-bold text-3xl" style={{ color: "var(--color-accent)" }}>
                <CountUp value={walletBalance} prefix="Rs. " />
              </p>
            </div>

            {/* Referral code */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                Your Referral Link
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 min-w-0 text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopy}
                  className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{ backgroundColor: copied ? "#2D1B4E" : "var(--color-accent)", color: copied ? "#fff" : "#1D1429" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Code: <span className="font-mono text-white">{user?.referralCode}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment & Referral Disclaimers */}
        <motion.div {...fadeUp(0.08)}>
          <DisclaimerBox />
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.1)}>
          <StatsRow leads={leads} loading={leadsLoading} />
        </motion.div>

        {/* Payment Details Card (Wallet Payout Setup) */}
        <motion.div {...fadeUp(0.15)}>
          <PaymentDetailsCard
            paymentDetails={paymentDetails}
            onSaveSuccess={(updated) => setPaymentDetails(updated)}
            cardRef={paymentCardRef}
            open={paymentCardOpen}
            onOpenChange={setPaymentCardOpen}
          />
        </motion.div>

        {/* Lead form */}
        <motion.div {...fadeUp(0.2)}>
          <LeadForm
            onSuccess={fetchLeads}
            open={leadFormOpen}
            onOpenChange={setLeadFormOpen}
            formRef={leadFormRef}
          />
        </motion.div>

        {/* Leads table */}
        <motion.div {...fadeUp(0.25)}>
          <LeadsTable leads={leads} loading={leadsLoading} onAddLead={openLeadForm} />
        </motion.div>

        {/* Withdrawals */}
        <motion.div {...fadeUp(0.3)}>
          <WithdrawalsPanel
            walletBalance={walletBalance}
            onBalanceUpdate={fetchMe}
            paymentDetails={paymentDetails}
            onOpenPaymentDetails={openPaymentCard}
          />
        </motion.div>

        {/* Messages shortcut */}
        <motion.div {...fadeUp(0.35)} className="mt-6 text-center">
          <Link
            to="/messages"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Open Messages
          </Link>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
