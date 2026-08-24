import { motion } from "framer-motion";

const DisclaimerBox = ({ className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 md:p-5 shadow-sm text-xs leading-relaxed space-y-3 mb-6 ${className}`}
      style={{
        backgroundColor: "#FEFCE8",
        border: "1.5px solid #FDE047",
        color: "#713F12",
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base flex-shrink-0">⚠️</span>
        <div>
          <p className="font-bold text-sm text-amber-950 mb-0.5">Payment Disclaimer:</p>
          <p className="text-amber-900 font-medium">
            Payments are released only after the client&apos;s assigned work has been successfully completed. Until the work is completed, the payment will remain pending and is not eligible for withdrawal.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 pt-2.5 border-t border-yellow-300/80">
        <span className="text-base flex-shrink-0">📢</span>
        <div>
          <p className="font-bold text-sm text-amber-950 mb-0.5">Referral Disclaimer:</p>
          <p className="text-amber-900 font-medium">
            Referral commissions are earned only when the referred user successfully brings valid client work to the platform. Simply referring or registering a user does not guarantee a commission.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DisclaimerBox;
