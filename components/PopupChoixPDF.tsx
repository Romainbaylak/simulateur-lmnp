"use client";

interface Props {
  onChoix: (choix: "synthese-pdf" | "banque-pdf") => void;
  onClose: () => void;
}

const OPTIONS = [
  {
    id: "synthese-pdf" as const,
    label: "Synthèse d'investissement",
    format: "PDF",
    pro: false,
  },
  {
    id: "banque-pdf" as const,
    label: "Synthèse financière – Banque",
    format: "PDF",
    pro: false,
  },
  {
    id: "synthese-word" as const,
    label: "Synthèse d'investissement",
    format: "Word",
    pro: true,
  },
  {
    id: "banque-word" as const,
    label: "Synthèse financière – Banque",
    format: "Word",
    pro: true,
  },
];

const FORMAT_STYLE: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "rgba(201,91,42,0.12)", color: "#C95B2A" },
  Word: { bg: "rgba(42,112,128,0.12)", color: "#2A7080" },
};

export default function PopupChoixPDF({ onChoix, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ background: "rgba(26,22,18,0.08)", color: "#1A1612", fontSize: 16 }}
        >×</button>

        <h2 className="font-medium text-xl text-center mb-6" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
          Choisi ton format de Synthèse
        </h2>

        <div className="space-y-3">
          {OPTIONS.map(opt => {
            const fmtStyle = FORMAT_STYLE[opt.format];

            if (opt.pro) {
              return (
                <div
                  key={opt.id}
                  className="relative w-full rounded-xl p-4 flex items-center gap-4 select-none"
                  style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.1)", opacity: 0.45 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "#1A1612" }}>{opt.label}</div>
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                      style={{ background: fmtStyle.bg, color: fmtStyle.color }}
                    >{opt.format}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#4E1F12", color: "#F5F0E8" }}>Pro</span>
                    <span style={{ fontSize: 16 }}>🔒</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={opt.id}
                onClick={() => onChoix(opt.id as "synthese-pdf" | "banque-pdf")}
                className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all hover:brightness-95"
                style={{ background: "#EDE7DC", border: `1px solid ${fmtStyle.color}30`, cursor: "pointer" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "#1A1612" }}>{opt.label}</div>
                  <span
                    className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                    style={{ background: fmtStyle.bg, color: fmtStyle.color }}
                  >{opt.format}</span>
                </div>
                <span style={{ color: fmtStyle.color, fontSize: 20, fontWeight: 700 }}>→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
