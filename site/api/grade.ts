import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/grade — standalone Vercel serverless function.
 *
 * The Astro site is built as static output (so astro-pagefind can index the
 * content pages), which means Astro's own /src/pages/api routes are NOT
 * deployed. Vercel DOES deploy functions from this top-level `api/` directory
 * regardless of static output, so this is where the grading endpoint lives.
 *
 * Grades short-answer questions using OpenRouter (deepseek/deepseek-chat).
 * Each question is scored out of 3 points against its rubric.
 *
 * Body: { items: [{ question, answer, modelAnswer?, rubric? }] }
 * Returns: { results: [{ score: 0-3, feedback: string }] }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENROUTER_API_KEY is not configured" });
    return;
  }

  const body = req.body as {
    items?: { question?: string; answer?: string; modelAnswer?: string; rubric?: string[] }[];
  };
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) {
    res.status(400).json({ error: "items array is required" });
    return;
  }

  const buildPrompt = (
    question: string,
    answer: string,
    modelAnswer?: string,
    rubric?: string[],
  ): string => {
    const rubricLines = Array.isArray(rubric) && rubric.length
      ? rubric.map((r, i) => `${i + 1}. ${r}`).join("\n")
      : "";

    return `You are an AI coach grading a short-answer question from a machine learning course taught in cricket terms.

QUESTION:
${question}

STUDENT ANSWER:
${answer}

${modelAnswer ? `MODEL ANSWER (for reference):\n${modelAnswer}\n` : ""}
${rubricLines ? `RUBRIC (each point worth 1, max 3):\n${rubricLines}\n` : ""}

Grade the student's answer out of 3 points based on the rubric. Be fair but rigorous — award a point only when the answer genuinely demonstrates that part of the rubric.

Respond with ONLY a JSON object in this exact format:
{"score": <integer 0-3>, "feedback": "<one sentence of constructive feedback>"}`;
  };

  // Grade all items concurrently, but tolerate individual failures so one
  // bad item never aborts the whole batch.
  const results = await Promise.all(
    items.map(async (item) => {
      const { question, answer, modelAnswer, rubric } = item;
      if (!question || !answer) {
        return { score: 0, feedback: "Grading failed: missing question or answer" };
      }

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [
              {
                role: "system",
                content:
                  "You are a strict but fair AI coach grading short-answer questions. Always respond with valid JSON only.",
              },
              { role: "user", content: buildPrompt(question, answer, modelAnswer, rubric) },
            ],
            temperature: 0.2,
            max_tokens: 250,
          }),
        });

        if (!response.ok) {
          return {
            score: 0,
            feedback: `Grading failed: OpenRouter error ${response.status}`,
          };
        }

        const data = await response.json();
        const content: string = data.choices?.[0]?.message?.content ?? "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return { score: 0, feedback: "Grading failed: could not parse response" };
        }

        const parsed = JSON.parse(jsonMatch[0]) as { score?: unknown; feedback?: unknown };
        const score = Math.max(0, Math.min(3, Math.round(Number(parsed.score) || 0)));
        const feedback =
          typeof parsed.feedback === "string" ? parsed.feedback : "";
        return { score, feedback };
      } catch (err) {
        return {
          score: 0,
          feedback: `Grading failed: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    }),
  );

  res.status(200).json({ results });
}