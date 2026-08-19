import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import NetworkVisualSmall from "../components/NetworkVisualSmall";

// ─── Floating Hero Network Visual ─────────────────────────────────────────────

const heroNodes = [
  { x: 15, y: 35, label: "You" },
  { x: 50, y: 20, label: "Zainab" },
  { x: 82, y: 30, label: "Ali" },
  { x: 30, y: 65, label: "Hamza" },
  { x: 68, y: 60, label: "Sara" },
  { x: 88, y: 80, label: "Client" },
  { x: 18, y: 88, label: "Lead" },
  { x: 52, y: 90, label: "Partner" },
];

const heroLinks = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4],
  [3, 6], [4, 5], [4, 7], [6, 7],
];

const HeroNetworkCanvas = () => (
  <div className="relative w-full h-full min-h-[340px] flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-full h-full max-w-[460px] max-h-[460px]">
      {/* Connection lines */}
      {heroLinks.map(([a, b], i) => (
        <motion.line
          key={`line-${i}`}
          x1={heroNodes[a].x}
          y1={heroNodes[a].y}
          x2={heroNodes[b].x}
          y2={heroNodes[b].y}
          stroke="rgba(217,164,65,0.4)"
          strokeWidth="0.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: i * 0.08, ease: "easeInOut" }}
        />
      ))}

      {/* Nodes */}
      {heroNodes.map((n, i) => (
        <g key={`node-${i}`}>
          {/* Pulsing ring */}
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={i === 0 || i === 4 ? 2.8 : 1.8}
            fill="none"
            stroke={i === 0 || i === 4 ? "#D9A441" : "rgba(255,255,255,0.45)"}
            strokeWidth="0.3"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{
              duration: 2.8,
              delay: 0.8 + i * 0.25,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeOut",
            }}
          />
          {/* Solid circle */}
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={i === 0 ? 3.0 : i === 4 ? 2.4 : 1.7}
            fill={i === 0 ? "#D9A441" : i === 4 ? "#F3C969" : "#ffffff"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
          />
          {/* Label */}
          <motion.text
            x={n.x}
            y={n.y - 3.8}
            textAnchor="middle"
            fill="rgba(255,255,255,0.85)"
            fontSize="2.4"
            fontWeight="600"
            fontFamily="Sora, sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.06 }}
          >
            {n.label}
          </motion.text>
        </g>
      ))}
    </svg>

    {/* Floating card highlights */}
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
      className="absolute bottom-4 left-4 sm:left-6 rounded-xl px-3.5 py-2.5 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(10, 59, 50, 0.75)",
        border: "1px solid rgba(217, 164, 65, 0.3)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs font-semibold text-white">Direct Reward</p>
      </div>
      <p className="text-sm font-bold font-display text-[#D9A441] mt-0.5">15% Commission</p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="absolute top-4 right-4 sm:right-6 rounded-xl px-3.5 py-2.5 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(10, 59, 50, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <p className="text-xs text-white/70">Network Tier 2</p>
      <p className="text-sm font-bold font-display text-white mt-0.5">+5% Passive Earnings</p>
    </motion.div>
  </div>
);

// ─── Landing Page Component ───────────────────────────────────────────────────

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* ── 1. Sticky Navigation Header ────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(247, 247, 242, 0.92)" : "transparent",
          borderBottom: scrolled ? "1.5px solid var(--color-border)" : "1.5px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: "#D9A441" }}
            >
              <span className="font-display font-bold text-sm text-white">R</span>
            </div>
            <span className="font-display font-bold text-xl" style={{ color: "var(--color-primary)" }}>
              Refer & Earn
            </span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(user.role === "admin" ? "/admin" : "/dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white shadow-sm transition-all"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <span>Go to Dashboard</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: "var(--color-text)" }}
                >
                  Log in
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-xl font-semibold text-sm text-white shadow-sm transition-all"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-6 pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl overflow-hidden shadow-xl"
            style={{
              background: "linear-gradient(160deg, #0A3B32 0%, #0E4F43 55%, #123F35 100%)",
              border: "1.5px solid rgba(217, 164, 65, 0.25)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16">
              {/* Left column: Text & CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-6"
                  style={{ backgroundColor: "rgba(217, 164, 65, 0.18)", border: "1px solid rgba(217, 164, 65, 0.4)" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#D9A441" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                    Multi-Tier Commission Platform
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4"
                >
                  Turn your network into <span style={{ color: "#D9A441" }}>recurring income.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Refer clients, track deal progress in real-time, and get automatic commission payouts. Earn from your direct leads and every client your network brings in.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register")}
                    className="px-6 py-3.5 rounded-xl font-display font-bold text-sm text-stone-900 shadow-md flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: "#D9A441" }}
                  >
                    <span>{user ? "View Your Dashboard" : "Create Free Account"}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </motion.button>

                  {!user && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/login")}
                      className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white transition-colors text-center"
                      style={{
                        border: "1.5px solid rgba(255, 255, 255, 0.25)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      I already have an account
                    </motion.button>
                  )}
                </motion.div>
              </div>

              {/* Right column: Interactive Visual Canvas */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <HeroNetworkCanvas />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Trust Strip ────────────────────────────────────────────────────── */}
      <section className="py-6 border-y" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3.5 p-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(14, 79, 67, 0.08)", color: "var(--color-primary)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm" style={{ color: "var(--color-text)" }}>
                  Fast Local Cashouts
                </h4>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  Direct to Easypaisa, JazzCash & Bank
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(217, 164, 65, 0.12)", color: "#D9A441" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm" style={{ color: "var(--color-text)" }}>
                  Real-Time Tracking
                </h4>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  Instant updates as leads progress
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(14, 79, 67, 0.08)", color: "var(--color-primary)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm" style={{ color: "var(--color-text)" }}>
                  100% Free & Transparent
                </h4>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  Zero hidden fees or deductions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. "How it Works" Section ─────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-text)" }}>
              How Refer & Earn Works
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "var(--color-muted)" }}>
              Three simple steps to start turning your professional and personal contacts into steady earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-2xl flex flex-col justify-between"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: "rgba(14, 79, 67, 0.08)", color: "var(--color-primary)" }}
                  >
                    01
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }}>
                    Step 1
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
                  Refer & Share
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  Share your unique referral link with potential clients or submit client leads directly through your referrer portal.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                  Instant custom referral link & QR
                </span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-2xl flex flex-col justify-between"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: "rgba(217, 164, 65, 0.15)", color: "#D9A441" }}
                  >
                    02
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }}>
                    Step 2
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
                  Track Lead Status
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  Monitor your leads in real-time as our team reviews them, engages with clients, and moves deals toward conversion.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "#D9A441" }}>
                  Live status pipeline updates
                </span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-2xl flex flex-col justify-between"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: "rgba(14, 79, 67, 0.08)", color: "var(--color-primary)" }}
                  >
                    03
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }}>
                    Step 3
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
                  Earn & Cash Out
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  Commissions are instantly credited to your wallet upon deal conversion. Request one-click withdrawals to your account anytime.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                  Automated wallet balances
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. Commission Structure Explainer ──────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "var(--color-surface)", borderTop: "1.5px solid var(--color-border)", borderBottom: "1.5px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: "rgba(217, 164, 65, 0.12)", color: "#9B701F" }}
            >
              2-Tier Reward Architecture
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-text)" }}>
              Earn directly, and from your network
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "var(--color-muted)" }}>
              Our multi-level commission system rewards you not only for clients you bring, but also for deals closed by people who joined through your referral.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Level 1 Card */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                  Level 1 • Direct
                </span>
                <span className="font-display font-extrabold text-4xl sm:text-5xl" style={{ color: "#D9A441" }}>
                  15%
                </span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>
                Direct Client Referrals
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
                When someone you personally referred registers and completes a successful deal or project, you receive 15% of the total deal value credited directly to your wallet.
              </p>

              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  Example calculation:
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  You refer a client with a <span className="font-semibold text-emerald-700">PKR 50,000</span> deal ➔ You earn <span className="font-semibold text-[#D9A441]">PKR 7,500</span> instantly.
                </p>
              </div>
            </motion.div>

            {/* Level 2 Card */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#123F35" }}>
                  Level 2 • Network
                </span>
                <span className="font-display font-extrabold text-4xl sm:text-5xl" style={{ color: "var(--color-primary)" }}>
                  5%
                </span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>
                Sub-Referral Network Deals
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
                When referrers you invited bring in their own clients who complete deals, they earn their 15% and you automatically earn a 5% network override bonus.
              </p>

              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  Example calculation:
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Zainab (your referral) closes a <span className="font-semibold text-emerald-700">PKR 50,000</span> deal ➔ Zainab earns PKR 7,500 and you get <span className="font-semibold text-emerald-800">PKR 2,500</span> without extra effort.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Interactive Flow Illustration */}
          <div
            className="p-6 rounded-2xl text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              backgroundColor: "rgba(14, 79, 67, 0.05)",
              border: "1px dashed rgba(14, 79, 67, 0.3)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                You
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Invites Referrers</span>
            </div>
            <span className="text-xs font-bold text-[#D9A441]">➔ Level 1 (15%) ➔</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: "#D9A441" }}>
                Team
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Refers Clients</span>
            </div>
            <span className="text-xs font-bold text-emerald-700">➔ Level 2 (5%) ➔</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white bg-emerald-800">
                💰
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Both Get Paid</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Final Call to Action ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-xl"
            style={{
              background: "linear-gradient(160deg, #0A3B32 0%, #0E4F43 60%, #123F35 100%)",
              border: "1.5px solid rgba(217, 164, 65, 0.3)",
            }}
          >
            {/* Ambient visual background */}
            <div className="absolute -top-12 -right-12 opacity-30 pointer-events-none">
              <NetworkVisualSmall className="w-72 h-72" dark />
            </div>
            <div className="absolute -bottom-12 -left-12 opacity-30 pointer-events-none">
              <NetworkVisualSmall className="w-72 h-72" dark />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 leading-tight">
                Ready to start earning from your network?
              </h2>
              <p className="text-sm sm:text-base mb-8" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Create your free referrer account in less than 2 minutes. No subscription fees, transparent commissions, and automated payouts.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-bold text-sm text-stone-900 shadow-lg transition-all"
                  style={{ backgroundColor: "#D9A441" }}
                >
                  {user ? "Open Your Dashboard" : "Create Free Account"}
                </motion.button>
                {!user && (
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    Existing user? Log in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 7. Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t py-12" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#D9A441" }}
              >
                <span className="font-display font-bold text-xs text-white">R</span>
              </div>
              <span className="font-display font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                Refer & Earn
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm font-medium" style={{ color: "var(--color-muted)" }}>
              <Link to="/login" className="hover:text-stone-900 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="hover:text-stone-900 transition-colors">
                Register
              </Link>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 600, behavior: "smooth" }); }} className="hover:text-stone-900 transition-colors">
                How It Works
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              © {new Date().getFullYear()} Refer & Earn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
