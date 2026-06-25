export default function Logo() {
  return (
    <div className="flex flex-col" style={{ lineHeight: 1.1 }}>
      <span style={{ fontWeight: 300, fontSize: 20, color: "#1A1612", letterSpacing: "-0.01em" }}>tout</span>
      <span style={{ fontWeight: 500, fontSize: 20, color: "#C95B2A", letterSpacing: "-0.01em" }}>lmnp</span>
      <div style={{ height: "0.5px", backgroundColor: "#1A1612", opacity: 0.15, marginTop: 3, marginBottom: 3 }} />
      <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "#1A1612", opacity: 0.4, fontWeight: 400, textTransform: "uppercase" }}>
        Simulateur de rentabilité
      </span>
    </div>
  );
}
