import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { useAuth } from "../context/AuthContext";
import NetworkVisualSmall from "../components/NetworkVisualSmall";
import CountUp from "../components/CountUp";
import TiltCard from "../components/TiltCard";
import Logo from "../components/Logo";

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

const HeroNetworkCanvas = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
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
            stroke="rgba(201,162,39,0.4)"
            strokeWidth="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.07, ease: "easeInOut" }}
          />
        ))}

        {/* Nodes */}
        {heroNodes.map((n, i) => (
          <g key={`node-${i}`}>
            {/* Pulsing ring on 'You' (0) and 'Sara' (4) */}
            {(i === 0 || i === 4) && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={2.8}
                fill="none"
                stroke="#C9A227"
                strokeWidth="0.3"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={
                  prefersReducedMotion
                    ? { scale: 1, opacity: 0.4 }
                    : { scale: [1, 2.7], opacity: [0.8, 0] }
                }
                transition={
                  prefersReducedMotion
                    ? {}
                    : {
                        duration: 2.8,
                        delay: 0.8 + (i === 0 ? 0 : 0.9),
                        repeat: Infinity,
                        repeatDelay: 1.4,
                        ease: "easeOut",
                      }
                }
              />
            )}
            {/* Solid circle */}
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={i === 0 ? 3.0 : i === 4 ? 2.4 : 1.7}
              fill={i === 0 ? "#C9A227" : i === 4 ? "#E5C358" : "#ffffff"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.4 + i * 0.06, ease: "easeOut" }}
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
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.65 + i * 0.06 }}
            >
              {n.label}
            </motion.text>
          </g>
        ))}
      </svg>

      {/* Floating card highlight 1 (Direct Reward) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: [0, -6, 0] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.5, delay: 0.9 }
            : {
                opacity: { duration: 0.5, delay: 0.9 },
                y: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.9,
                },
              }
        }
        className="absolute bottom-4 left-4 sm:left-6 rounded-xl px-3.5 py-2.5 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(28, 16, 50, 0.85)",
          border: "1px solid rgba(201, 162, 39, 0.3)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-xs font-semibold text-white">Direct Reward</p>
        </div>
        <p className="text-sm font-bold font-display text-[#C9A227] mt-0.5">15% Commission</p>
      </motion.div>

      {/* Floating card highlight 2 (Network Tier 2) */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: [0, 6, 0] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.5, delay: 1.1 }
            : {
                opacity: { duration: 0.5, delay: 1.1 },
                y: {
                  duration: 4.0,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                },
              }
        }
        className="absolute top-4 right-4 sm:right-6 rounded-xl px-3.5 py-2.5 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(28, 16, 50, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <p className="text-xs text-white/70">Network Tier 2</p>
        <p className="text-sm font-bold font-display text-white mt-0.5">+5% Passive Earnings</p>
      </motion.div>
    </div>
  );
};

// ─── Trust Strip Items ────────────────────────────────────────────────────────

const trustItems = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    iconBg: "rgba(45, 27, 78, 0.08)",
    iconColor: "var(--color-primary)",
    title: "Fast Local Cashouts",
    subtitle: "Direct to Easypaisa, JazzCash & Bank",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    iconBg: "rgba(201, 162, 39, 0.12)",
    iconColor: "var(--color-accent)",
    title: "Real-Time Tracking",
    subtitle: "Instant updates as leads progress",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    iconBg: "rgba(45, 27, 78, 0.08)",
    iconColor: "var(--color-primary)",
    title: "100% Free & Transparent",
    subtitle: "Zero hidden fees or deductions",
  },
];

// ─── Step Cards Data ──────────────────────────────────────────────────────────

const stepsData = [
  {
    num: "01",
    step: "Step 1",
    title: "Refer & Share",
    desc: "Share your unique referral link with potential clients or submit client leads directly through your referrer portal.",
    highlight: "Instant custom referral link & QR",
    iconBg: "rgba(45, 27, 78, 0.08)",
    iconColor: "var(--color-primary)",
    badgeColor: "var(--color-primary)",
  },
  {
    num: "02",
    step: "Step 2",
    title: "Track Lead Status",
    desc: "Monitor your leads in real-time as our team reviews them, engages with clients, and moves deals toward conversion.",
    highlight: "Live status pipeline updates",
    iconBg: "rgba(201, 162, 39, 0.15)",
    iconColor: "var(--color-accent)",
    badgeColor: "var(--color-accent)",
  },
  {
    num: "03",
    step: "Step 3",
    title: "Earn & Cash Out",
    desc: "Commissions are instantly credited to your wallet upon deal conversion. Request one-click withdrawals to your account anytime.",
    highlight: "Automated wallet balances",
    iconBg: "rgba(45, 27, 78, 0.08)",
    iconColor: "var(--color-primary)",
    badgeColor: "var(--color-primary)",
  },
];

// ─── Landing Page Component ───────────────────────────────────────────────────

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  // Check hover capability and viewport width for mouse-specific effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanHover(mq.matches && window.innerWidth >= 768);
      const handler = (e) => setCanHover(e.matches && window.innerWidth >= 768);
      mq.addEventListener("change", handler);
      const resizeHandler = () => setCanHover(mq.matches && window.innerWidth >= 768);
      window.addEventListener("resize", resizeHandler);
      return () => {
        mq.removeEventListener("change", handler);
        window.removeEventListener("resize", resizeHandler);
      };
    }
  }, []);

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── 1. Parallax Scroll Target Refs ───────────────────────────────────────────
  const heroSectionRef = useRef(null);
  const trustSectionRef = useRef(null);
  const commissionSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);

  // Hero section parallax: diagram moves ~30-40% distance as user scrolls
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });
  const heroDiagramY = useTransform(
    heroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -50]
  );

  // Trust strip parallax: icon row drifts slightly upward
  const { scrollYProgress: trustScroll } = useScroll({
    target: trustSectionRef,
    offset: ["start end", "end start"],
  });
  const trustIconsY = useTransform(
    trustScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [10, -10]
  );

  // Commission section parallax: background elements shift relative to foreground
  const { scrollYProgress: commissionScroll } = useScroll({
    target: commissionSectionRef,
    offset: ["start end", "end start"],
  });
  const commissionBgY = useTransform(
    commissionScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, -20]
  );

  // Final CTA section parallax: ambient dots shift position
  const { scrollYProgress: ctaScroll } = useScroll({
    target: ctaSectionRef,
    offset: ["start end", "end start"],
  });
  const ctaParallaxY1 = useTransform(
    ctaScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [25, -25]
  );
  const ctaParallaxY2 = useTransform(
    ctaScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-20, 20]
  );

  // ── 2. Hero Cursor Spotlight Glow ────────────────────────────────────────────
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const spotlightOpacity = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 22 };
  const smoothSpotlightX = useSpring(mouseX, springConfig);
  const smoothSpotlightY = useSpring(mouseY, springConfig);
  const smoothSpotlightOpacity = useSpring(spotlightOpacity, { stiffness: 180, damping: 24 });

  const spotlightBackground = useMotionTemplate`radial-gradient(550px circle at ${smoothSpotlightX}px ${smoothSpotlightY}px, rgba(201, 162, 39, 0.16), rgba(45, 27, 78, 0.04) 50%, transparent 80%)`;

  const handleHeroMouseMove = (e) => {
    if (!canHover || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    spotlightOpacity.set(1);
  };

  const handleHeroMouseLeave = () => {
    spotlightOpacity.set(0);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* ── 1. Sticky Navigation Header ────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(250, 248, 245, 0.92)" : "transparent",
          borderBottom: scrolled ? "1.5px solid var(--color-border)" : "1.5px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo size={36} className="transition-transform group-hover:scale-105" />
            <span className="font-display font-bold text-xl" style={{ color: "var(--color-primary)" }}>
              Apexora Referrals
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
      <section ref={heroSectionRef} className="relative overflow-hidden pt-6 pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            className="rounded-3xl overflow-hidden shadow-xl relative"
            style={{
              background: "linear-gradient(160deg, #1C1032 0%, #2D1B4E 55%, #22143D 100%)",
              border: "1.5px solid rgba(201, 162, 39, 0.25)",
            }}
          >
            {/* Cursor Spotlight Glow Overlay */}
            {canHover && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-0 rounded-3xl"
                style={{
                  background: spotlightBackground,
                  opacity: smoothSpotlightOpacity,
                }}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16 relative z-10">
              {/* Left column: Text & CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {/* Badge pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-6"
                  style={{ backgroundColor: "rgba(201, 162, 39, 0.18)", border: "1px solid rgba(201, 162, 39, 0.4)" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                    Multi-Tier Commission Platform
                  </span>
                </motion.div>

                {/* Staggered headline */}
                <div className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
                  >
                    Turn your network into
                  </motion.span>
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.27, ease: "easeOut" }}
                    style={{ color: "#C9A227" }}
                  >
                    recurring income.
                  </motion.span>
                </div>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.38, ease: "easeOut" }}
                  className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Refer clients, track deal progress in real-time, and get automatic commission payouts. Earn from your direct leads and every client your network brings in.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.48, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register")}
                    className="px-6 py-3.5 rounded-xl font-display font-bold text-sm text-stone-900 shadow-md flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: "var(--color-accent)", color: "#1D1429" }}
                  >
                    <span>{user ? "View Your Dashboard" : "Create Free Account"}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </motion.button>

                  {!user && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
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

              {/* Right column: Interactive Visual Canvas with Parallax Scroll */}
              <motion.div
                style={{ y: heroDiagramY }}
                className="lg:col-span-5 flex items-center justify-center"
              >
                <HeroNetworkCanvas />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Trust Strip ────────────────────────────────────────────────────── */}
      <section ref={trustSectionRef} className="py-6 border-y" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="flex items-center justify-center md:justify-start gap-3.5 p-2"
              >
                <motion.div
                  style={{ y: trustIconsY }}
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                >
                  {item.icon}
                </motion.div>
                <div>
                  <h4 className="font-display font-bold text-sm" style={{ color: "var(--color-text)" }}>
                    {item.title}
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. "How it Works" Section ─────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-text)" }}>
              How Apexora Referrals Works
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "var(--color-muted)" }}>
              Three simple steps to start turning your professional and personal contacts into steady earnings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stepsData.map((step, i) => (
              <TiltCard
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px -12px rgba(45, 27, 78, 0.18)" }}
                className="p-7 rounded-2xl flex flex-col justify-between transition-shadow cursor-default h-full"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.12, type: "spring", stiffness: 350, damping: 22 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: step.iconBg, color: step.iconColor }}
                    >
                      {step.num}
                    </motion.div>
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {step.desc}
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.12 }}
                  className="mt-6 pt-4 border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span className="text-xs font-semibold" style={{ color: step.badgeColor }}>
                    {step.highlight}
                  </span>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Commission Structure Explainer ──────────────────────────────────── */}
      <section ref={commissionSectionRef} className="py-16 relative overflow-hidden" style={{ backgroundColor: "var(--color-surface)", borderTop: "1.5px solid var(--color-border)", borderBottom: "1.5px solid var(--color-border)" }}>
        {/* Subtle parallax decorative background */}
        <motion.div
          style={{ y: commissionBgY }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: "rgba(201, 162, 39, 0.12)", color: "#AA8518" }}
            >
              2-Tier Reward Architecture
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: "var(--color-text)" }}>
              Earn directly, and from your network
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "var(--color-muted)" }}>
              Our multi-level commission system rewards you not only for clients you bring, but also for deals closed by people who joined through your referral.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Level 1 3D Tilt Card */}
            <TiltCard
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              whileHover={{ y: -4, boxShadow: "0 12px 24px -12px rgba(45, 27, 78, 0.18)" }}
              className="p-8 rounded-3xl relative overflow-hidden transition-shadow h-full"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                  Level 1 • Direct
                </span>
                <span className="font-display font-extrabold text-4xl sm:text-5xl" style={{ color: "var(--color-accent)" }}>
                  <CountUp value={15} suffix="%" duration={1.2} />
                </span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>
                Direct Client Referrals
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
                When someone you personally referred registers and completes a successful deal or project, you receive 15% of the total deal value credited directly to your wallet.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="p-4 rounded-xl"
                style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  Example calculation:
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  You refer a client with a <span className="font-semibold text-purple-900">PKR 50,000</span> deal ➔ You earn <span className="font-semibold text-[#C9A227]">PKR 7,500</span> instantly.
                </p>
              </motion.div>
            </TiltCard>

            {/* Level 2 3D Tilt Card */}
            <TiltCard
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              whileHover={{ y: -4, boxShadow: "0 12px 24px -12px rgba(45, 27, 78, 0.18)" }}
              className="p-8 rounded-3xl relative overflow-hidden transition-shadow h-full"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#1C1032" }}>
                  Level 2 • Network
                </span>
                <span className="font-display font-extrabold text-4xl sm:text-5xl" style={{ color: "var(--color-primary)" }}>
                  <CountUp value={5} suffix="%" duration={1.2} />
                </span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>
                Sub-Referral Network Deals
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
                When referrers you invited bring in their own clients who complete deals, they earn their 15% and you automatically earn a 5% network override bonus.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.35 }}
                className="p-4 rounded-xl"
                style={{ backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  Example calculation:
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Zainab (your referral) closes a <span className="font-semibold text-purple-900">PKR 50,000</span> deal ➔ Zainab earns PKR 7,500 and you get <span className="font-semibold text-purple-950">PKR 2,500</span> without extra effort.
                </p>
              </motion.div>
            </TiltCard>
          </div>

          {/* Interactive Flow Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              backgroundColor: "rgba(45, 27, 78, 0.05)",
              border: "1px dashed rgba(45, 27, 78, 0.3)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 350, damping: 22 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                You
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Invites Referrers</span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="text-xs font-bold text-[#C9A227]"
            >
              ➔ Level 1 (15%) ➔
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4, type: "spring", stiffness: 350, damping: 22 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: "var(--color-accent)" }}>
                Team
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Refers Clients</span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.55 }}
              className="text-xs font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              ➔ Level 2 (5%) ➔
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7, type: "spring", stiffness: 350, damping: 22 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                💰
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Both Get Paid</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. Final Call to Action ───────────────────────────────────────────── */}
      <section ref={ctaSectionRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-xl"
            style={{
              background: "linear-gradient(160deg, #1C1032 0%, #2D1B4E 60%, #22143D 100%)",
              border: "1.5px solid rgba(201, 162, 39, 0.3)",
            }}
          >
            {/* Ambient drifting & parallax visual background 1 */}
            <motion.div
              style={{ y: ctaParallaxY1 }}
              className="absolute -top-12 -right-12 pointer-events-none"
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [0, 8, -6, 0],
                        y: [0, -10, 6, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? {}
                    : {
                        duration: 9,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                      }
                }
                className="opacity-30"
              >
                <NetworkVisualSmall className="w-72 h-72" dark />
              </motion.div>
            </motion.div>

            {/* Ambient drifting & parallax visual background 2 */}
            <motion.div
              style={{ y: ctaParallaxY2 }}
              className="absolute -bottom-12 -left-12 pointer-events-none"
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [0, -8, 6, 0],
                        y: [0, 8, -6, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? {}
                    : {
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: 1,
                      }
                }
                className="opacity-30"
              >
                <NetworkVisualSmall className="w-72 h-72" dark />
              </motion.div>
            </motion.div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 leading-tight"
              >
                Ready to start earning from your network?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="text-sm sm:text-base mb-8"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Create your free referrer account in less than 2 minutes. No subscription fees, transparent commissions, and automated payouts.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-bold text-sm text-stone-900 shadow-lg transition-all"
                  style={{ backgroundColor: "var(--color-accent)", color: "#1D1429" }}
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
              </motion.div>
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
              <Logo size={28} />
              <span className="font-display font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                Apexora Referrals
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
              © {new Date().getFullYear()} Apexora Referrals. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
