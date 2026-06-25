interface LogoProps {
  variant?: "dark" | "light";
}

export default function Logo({ variant = "dark" }: LogoProps) {
  const toutColor   = variant === "light" ? "#F5F0E8" : "#1A1612";
  const divColor    = variant === "light" ? "rgba(245,240,232,0.2)" : "rgba(26,22,18,0.15)";
  const labelColor  = variant === "light" ? "rgba(245,240,232,0.45)" : "rgba(26,22,18,0.4)";

  return (
    <div className="flex flex-col items-center" style={{ lineHeight: 1.1, textAlign: "center" }}>
      <span style={{ fontWeight: 300, fontSize: 20, color: toutColor, letterSpacing: "-0.01em" }}>tout</span>
      <span style={{ fontWeight: 500, fontSize: 20, color: "#C95B2A", letterSpacing: "-0.01em" }}>lmnp</span>
      <div style={{ height: "0.5px", backgroundColor: divColor, marginTop: 3, marginBottom: 3, width: "100%" }} />
      <span style={{ fontSize: 10, letterSpacing: "0.14em", color: labelColor, fontWeight: 400, textTransform: "uppercase" }}>
        Simulateur de rentabilité
      </span>
    </div>
  );
}
