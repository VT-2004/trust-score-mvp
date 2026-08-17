import fetch from "node-fetch";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an analyst generating a plain-English "authenticity consistency report" for a developer's GitHub portfolio, to help a freelance client evaluate a freelancer's claimed work.

The data you receive has TWO separate groups, already split out for you:
- "standaloneProjects": self-directed projects (portfolio pieces, personal builds)
- "assignmentRepos": repos named/described like assignments — these could be university coursework OR a real take-home test from a company. You cannot tell which from the data alone, so treat them as a distinct, separately-reported category rather than guessing.

CRITICAL RULES:
- You are NOT a fraud detector. You are a consistency/plausibility summarizer.
- Never state or imply someone definitely cheated, lied, or committed fraud.
- Always frame flags as "worth a closer look" or "inconsistent with typical patterns", never as accusations.
- A single commit in an assignmentRepos entry is NORMAL and EXPECTED (write locally, push once when done) — do not flag it as suspicious. For standaloneProjects, a single commit IS worth noting since organic project work usually shows iteration.
- Report on both groups. Do not blend them into one number or one narrative — a reader needs to know how the person's real projects look AND how their assignment-style repos look, separately.
- Base your summary ONLY on the numeric signals and notes provided to you. Do not invent details.
- Be balanced: mention genuine positive signals as clearly as any concerns.
- Output ONLY valid JSON, no markdown fences, no preamble, matching this exact schema:
{
  "standalone_summary": "2-3 sentence summary of what the standalone project repos show",
  "assignment_summary": "1-2 sentence summary of what the assignment-style repos show (skip nuance about coursework vs company test since we can't tell which)",
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