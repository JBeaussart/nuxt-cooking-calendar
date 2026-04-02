import type { H3Event } from "h3";
import { setHeader } from "h3";

type RecipeRow = {
  title: string;
  ingredients: any[];
  steps: string[];
};

async function renderPdf(event: H3Event, recipes: RecipeRow[]) {
  const mod: any = await import("pdfkit");
  const PDFDocument = mod?.default || mod;

  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: "Mes recettes",
      Author: "Cooking Calendar",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(20).text("Mes recettes", { underline: false });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#6b7280").text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`);
  doc.fillColor("black");
  doc.moveDown(1);

  recipes.forEach((r, idx) => {
    if (idx > 0) doc.addPage();

    doc.fontSize(16).text(String(r.title || "Sans titre").trim());
    doc.moveDown(0.8);

    // Ingredients
    doc.fontSize(12).text("Ingrédients");
    doc.moveDown(0.4);
    doc.fontSize(11);
    for (const ing of r.ingredients || []) {
      const item = typeof ing === "string" ? ing : ing?.item;
      if (!item) continue;
      const qty = typeof ing === "object" ? ing?.quantity : undefined;
      const unit = typeof ing === "object" ? ing?.unit : undefined;
      const line =
        qty != null && qty !== ""
          ? `- ${item}${unit ? ` : ${qty} ${unit}` : ` : ${qty}`}`
          : `- ${item}${unit ? ` : ${unit}` : ""}`;
      doc.text(line);
    }

    doc.moveDown(0.8);

    // Steps
    const steps = Array.isArray(r.steps) ? r.steps : [];
    if (steps.length) {
      doc.fontSize(12).text("Étapes");
      doc.moveDown(0.4);
      doc.fontSize(11);
      steps
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .forEach((s, i) => doc.text(`${i + 1}. ${s}`));
    } else {
      doc.fontSize(12).fillColor("#6b7280").text("Aucune étape.");
      doc.fillColor("black");
    }
  });

  doc.end();
  return await done;
}

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { data, error } = await supabase
    .from("recipes")
    .select("title, ingredients, steps")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  const pdf = await renderPdf(event, (data || []) as RecipeRow[]);

  const filename = `mes-recettes-${new Date().toISOString().split("T")[0]}.pdf`;
  setHeader(event, "Content-Type", "application/pdf");
  setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);
  return pdf;
});

