interface LogoProps {
  variant?: "dark" | "light";
  compact?: boolean;
}

export default function Logo({ variant = "dark", compact = false }: LogoProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md" style={{ background: "#EDE7DC" }}>
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontWeight: 300, fontSize: 18, color: "#1A1612", letterSpacing: "-0.01em" }}>tout</div>
          <div style={{ fontWeight: 500, fontSize: 18, color: "#C95B2A", letterSpacing: "-0.01em" }}>lmnp</div>
        </div>
        <div style={{ width: "0.5px", alignSelf: "stretch", background: "rgba(26,22,18,0.18)", margin: "1px 0", flexShrink: 0 }} />
        <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(26,22,18,0.45)", textTransform: "uppercase", fontWeight: 500, lineHeight: 1.55 }}>
          Simulateur<br />de rentabilité
        </div>
      </div>
    );
  }

  const toutColor  = variant === "light" ? "#F5F0E8" : "#1A1612";
  const divColor   = variant === "light" ? "rgba(245,240,232,0.2)" : "rgba(26,22,18,0.15)";
  const labelColor = variant === "light" ? "rgba(245,240,232,0.45)" : "rgba(26,22,18,0.4)";

  return (
    <div className="flex flex-col items-center" style={{ lineHeight: 1.1, textAlign: "center" }}>
      <span style={{ fontWeight: 300, fontSize: 20, color: toutColor, letterSpacing: "-0.01em" }}>tout</span>
      <span style={{ fontWeight: 500, fontSize: 20, color: "#C95B2A", letterSpacing: "-0.01em" }}>lmnp</span>
      <div style={{ height: "1.5px", backgroundColor: divColor, marginTop: 3, marginBottom: 3, width: "100%" }} />
      <span style={{ fontSize: 10, letterSpacing: "0.14em", color: labelColor, fontWeight: 400, textTransform: "uppercase" }}>
        Simulateur de rentabilité
      </span>
    </div>
  );
}
