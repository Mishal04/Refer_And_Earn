import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/**
 * Reusable 3D Tilt Card wrapper with smooth Framer Motion spring physics.
 * Automatically respects prefers-reduced-motion and touch devices.
 */
const TiltCard = ({
  children,
  className = "",
  style = {},
  maxTilt = 6.5,
  whileHover = { y: -4, boxShadow: "0 12px 24px -12px rgba(45, 27, 78, 0.18)" },
  ...motionProps
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanHover(mq.matches && window.innerWidth >= 768);
      const handler = (e) => setCanHover(e.matches && window.innerWidth >= 768);
      mq.addEventListener("change", handler);
      const resizeHandler = () => {
        setCanHover(mq.matches && window.innerWidth >= 768);
      };
      window.addEventListener("resize", resizeHandler);
      return () => {
        mq.removeEventListener("change", handler);
        window.removeEventListener("resize", resizeHandler);
      };
    }
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 22 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const isInteractive = canHover && !prefersReducedMotion;

  const handleMouseMove = (e) => {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div style={{ perspective: 1000, transformStyle: "preserve-3d" }} className="w-full h-full">
      <motion.div
        className={className}
        style={{
          ...style,
          rotateX: isInteractive ? rotateX : 0,
          rotateY: isInteractive ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={whileHover}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...motionProps}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default TiltCard;
