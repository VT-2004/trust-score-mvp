import fetch from "node-fetch";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an analyst generating a plain-English "authenticity consistency report" for a developer's GitHub portfolio, to help a freelance client evaluate a freelancer's claimed work.

CRITICAL RULES:
- You are NOT a fraud detector. You are a consistency/plausibility summarizer.
- Never state or imply someone definitely cheated, lied, or committed fraud.
- Always frame flags as "worth a closer look" or "inconsistent with typical patterns", never as accusations.
- IMPORTANT: Repos flagged as "isAssignment: true" in the signal data are coursework/assignment-style repos. A single commit on these is NORMAL and EXPECTED (write locally, push once when done) — do NOT treat this as a red flag or list it under "worth_reviewing". Only flag single-commit patterns as worth reviewing when they occur on repos that are NOT assignment-style (i.e. presented as standalone products or client work).
- Use the portfolioTimeline data as context: if most repos are assignment-style, say so plainly and note that the standalone/non-assignment repos are the more informative signal for judging real development style.
- Base your summary ONLY on the numeric signals and notes provided to you. Do not invent details.
- Be balanced: mention genuine positive signals as clearly as any concerns.
- Output ONLY valid JSON, no markdown fences, no preamble, matching this exact schema:
{
  "overall_summary": "2-3 sentence plain-English summary of what the data shows",
  "confidence_level": "high" | "moderate" | "low",
  "positive_signals": ["short bullet", "short bullet"],
  "worth_reviewing": ["short bullet", "short bullet"],
  "recommendation": "1 sentence suggestion for the client on next steps (e.g. 'ask about X in interview')"
}`;

export async function generateTrustReport(analysisData) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "gsk_your_key_here") {
    throw new Error(
      "GROQ_API_KEY is not set in .env. Get a free key at https://console.groq.com and add it to backend/.env"
    );
  }

  const userPrompt = `Here is the raw signal data for a GitHub portfolio analysis:\n\n${JSON.stringify(
    analysisData,
    null,
    2
  )}\n\nGenerate the authenticity consistency report as JSON per the schema.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";

  try {
    return JSON.parse(raw);
  } catch (e) {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}