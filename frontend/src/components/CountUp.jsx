import { useState, useEffect, useRef } from "react";
import { animate } from "framer-motion";

/**
 * Animated count-up number using Framer Motion's animate()
 * @param {number} value - target number
 * @param {number} duration - animation duration in seconds
 * @param {string} prefix - prefix string (e.g. "Rs. ")
 * @param {string} suffix - suffix string (e.g. "%")
 * @param {number} decimals - number of decimal places (default 0)
 */
const CountUp = ({
  value = 0,
  duration = 0.9,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const numValue = Number(value) || 0;
  const [display, setDisplay] = useState(numValue);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, numValue, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = numValue;
    return () => controls.stop();
  }, [numValue, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
};

export default CountUp;
