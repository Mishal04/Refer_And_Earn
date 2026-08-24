const Logo = ({ size = 36, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    role="img"
    aria-label="Apexora Referrals logo"
  >
    <path
      d="M50,4 L89.8,27 L89.8,73 L50,96 L10.2,73 L10.2,27 Z"
      fill="#2D1B4E"
      stroke="#D9A441"
      strokeWidth="3"
    />
    <path d="M50,20 L43,32 L57,32 Z" fill="#D9A441" />
    <rect x="46" y="32" width="8" height="14" fill="#D9A441" />
    <circle cx="39" cy="63" r="16" fill="none" stroke="#D9A441" strokeWidth="6" />
    <circle cx="61" cy="63" r="16" fill="none" stroke="#F7F7F2" strokeWidth="6" />
  </svg>
);

export default Logo;
