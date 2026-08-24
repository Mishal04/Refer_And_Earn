import { motion } from "framer-motion";

const nodes = [
  { x: 20, y: 30 }, { x: 55, y: 15 }, { x: 80, y: 35 },
  { x: 30, y: 60 }, { x: 65, y: 55 }, { x: 85, y: 75 },
  { x: 15, y: 85 }, { x: 50, y: 90 },
];
const links = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4],
  [3, 6], [4, 5], [4, 7], [6, 7],
];

/**
 * Reusable network visual accent.
 * @param {string} className  - container class (controls size)
 * @param {number} opacity    - overall opacity (default 1)
 * @param {boolean} dark      - use dark-panel colors vs light-panel colors
 */
const NetworkVisualSmall = ({ className = "w-32 h-32", opacity = 1, dark = false }) => {
  const lineColor = dark ? "rgba(201,162,39,0.35)" : "rgba(45,27,78,0.2)";
  const nodeFill = dark ? "#ffffff" : "var(--color-primary)";
  const highlightFill = "var(--color-accent)";
  const pulseStroke = dark ? "rgba(255,255,255,0.4)" : "rgba(45,27,78,0.25)";

  return (
    <div className={className} style={{ opacity }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {links.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke={lineColor}
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.0, delay: i * 0.06, ease: "easeInOut" }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x} cy={n.y}
            r={i === 4 ? 2.2 : 1.4}
            fill={i === 4 ? highlightFill : nodeFill}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx={n.x} cy={n.y}
            r={1.4}
            fill="none"
            stroke={i === 4 ? highlightFill : pulseStroke}
            strokeWidth="0.4"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{
              duration: 2.5,
              delay: 1.0 + i * 0.3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default NetworkVisualSmall;
