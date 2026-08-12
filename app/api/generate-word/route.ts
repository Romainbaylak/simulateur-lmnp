import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateWordReport } from "@/lib/generateWordReport";
import { computeResultats } from "@/lib/computeResultats";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    form, amortPct, amortMode, amortDureeEnsemble,
    amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
    composants, isSaisonnier, prixNuitee,
    tauxOccBas, tauxOccMoyen, tauxOccHaut,
    resultatsTriple, selectedRegime,
  } = body;

  if (!form) {
    return NextResponse.json({ error: "Missing form data" }, { status: 400 });
  }

  const loyerMensuel = parseFloat(form.loyer) || 0;
  const resultats = computeResultats(form, loyerMensuel, amortPct ?? 80, amortMode ?? "ensemble", amortDureeEnsemble ?? 30, composants ?? []);
  if (!resultats) {
    return NextResponse.json({ error: "Could not compute results" }, { status: 400 });
  }

  const buffer = await generateWordReport({
    form,
    resultats: resultats as any,
    selectedRegime: selectedRegime ?? null,
    amortPct: amortPct ?? 80,
    amortMode: amortMode ?? "ensemble",
    amortDureeEnsemble: amortDureeEnsemble ?? 30,
    composants: composants ?? [],
    isSaisonnier: isSaisonnier ?? false,
    prixNuitee,
    tauxOccBas,
    tauxOccMoyen,
    tauxOccHaut,
    resultatsTriple,
  });

  const filename = `rapport-lmnp-${new Date().toISOString().slice(0, 10)}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
