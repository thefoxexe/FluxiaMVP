import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { description, contact_name } = await req.json();

  if (!description) return NextResponse.json({ error: "Description requise" }, { status: 400 });

  const prompt = `Tu es un assistant de facturation pour une entreprise. Génère un devis structuré basé sur la description suivante.

Description du travail : "${description}"
${contact_name ? `Client : ${contact_name}` : ""}

Réponds UNIQUEMENT avec un JSON valide dans ce format exact, sans aucun texte avant ou après :
{
  "title": "Titre court du devis",
  "items": [
    { "description": "Nom de la prestation", "quantity": 1, "unit_price": 0 }
  ],
  "notes": "Note optionnelle sur le devis ou les conditions"
}

Règles :
- 1 à 6 lignes de prestation maximum
- Les prix sont en CHF, réalistes pour le marché suisse
- Le titre doit être concis (5 mots max)
- Les notes sont courtes (1-2 phrases max) ou null si pas pertinent`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
