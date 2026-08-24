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
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-200/60 flex items-center justify-center flex-shrink-0 text-amber-900 mt-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm text-amber-950 mb-0.5">Payment Disclaimer:</p>
          <p className="text-amber-900 font-medium">
            Payments are released only after the client&apos;s assigned work has been successfully completed. Until the work is completed, the payment will remain pending and is not eligible for withdrawal.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 pt-3 border-t border-yellow-300/80">
        <div className="w-7 h-7 rounded-lg bg-amber-200/60 flex items-center justify-center flex-shrink-0 text-amber-900 mt-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
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
