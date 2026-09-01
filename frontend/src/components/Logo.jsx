import logoImg from "../assets/logo.png";

const Logo = ({ height = 56, className = "" }) => (
  <img
    src={logoImg}
    alt="Apexora 360 Referrals"
    height={height}
    style={{ height: `${height}px`, width: "auto", display: "block" }}
    className={className}
  />
);

export default Logo;
