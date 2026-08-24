import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const nodes = [
  { x: 20, y: 30 }, { x: 55, y: 15 }, { x: 80, y: 35 },
  { x: 30, y: 60 }, { x: 65, y: 55 }, { x: 85, y: 75 },
  { x: 15, y: 85 }, { x: 50, y: 90 },
];
const links = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4],
  [3, 6], [4, 5], [4, 7], [6, 7],
];

const NetworkVisual = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {links.map(([a, b], i) => (
      <motion.line
        key={i}
        x1={nodes[a].x} y1={nodes[a].y}
        x2={nodes[b].x} y2={nodes[b].y}
        stroke="rgba(201,162,39,0.35)"
        strokeWidth="0.3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: i * 0.08, ease: "easeInOut" }}
      />
    ))}
    {nodes.map((n, i) => (
      <motion.circle
        key={i}
        cx={n.x} cy={n.y}
        r={i === 4 ? 2.6 : 1.6}
        fill={i === 4 ? "#C9A227" : "#ffffff"}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
      />
    ))}
    {nodes.map((n, i) => (
      <motion.circle
        key={`pulse-${i}`}
        cx={n.x} cy={n.y}
        r={1.6}
        fill="none"
        stroke={i === 4 ? "#C9A227" : "rgba(255,255,255,0.5)"}
        strokeWidth="0.3"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{
          duration: 2.5,
          delay: 1.2 + i * 0.3,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "easeOut",
        }}
      />
    ))}
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Left: animated network panel */}
      <div
        className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #1C1032 0%, #2D1B4E 55%, #22143D 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <Logo size={36} />
          <span className="font-display font-bold text-xl text-white">Apexora Referrals</span>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center opacity-90">
          <div className="w-[70%] h-[70%]">
            <NetworkVisual />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10"
        >
          <h2 className="font-display font-bold text-3xl text-white leading-tight mb-2">
            Every connection<br />is an opportunity.
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Refer a client, grow your network, earn on every level.
          </p>
        </motion.div>
      </div>

      {/* Right: login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <Logo size={36} />
            <span className="font-display font-bold text-xl" style={{ color: "var(--color-primary)" }}>
              Apexora Referrals
            </span>
          </div>

          <h2 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--color-text)" }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
            Log in to track your leads and earnings.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm px-3 py-2 rounded-lg mb-4"
              style={{ backgroundColor: "#FBEAEA", color: "#9B2C2C" }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ border: "1.5px solid var(--color-border)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-muted)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ border: "1.5px solid var(--color-border)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={loading}
              className="w-full text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Logging in..." : "Log in"}
            </motion.button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "var(--color-muted)" }}>
            New here?{" "}
            <Link to="/register" className="font-semibold" style={{ color: "var(--color-accent-dark)" }}>
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
