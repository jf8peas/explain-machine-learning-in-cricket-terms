import type { APIRoute } from "astro";

/**
 * POST /api/grade
 *
 * Grades a short-answer question using OpenRouter (deepseek/deepseek-chat).
 * Scores the answer out of 3 points against the question's rubric.
 *
 * Body: { question, answer, modelAnswer?, rubric? }
 * Returns: { score: 0-3, feedback: string }
 */
export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENROUTER_API_KEY as string | undefined;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { question?: string; answer?: string; modelAnswer?: string; rubric?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { question, answer, modelAnswer, rubric } = body;
  if (!question || !answer) {
    return new Response(
      JSON.stringify({ error: "question and answer are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const rubricLines = Array.isArray(rubric) && rubric.length
    ? rubric.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "";

  const prompt = `You are an AI coach grading a short-answer question from a machine learning course taught in cricket terms.

QUESTION:
${question}

STUDENT ANSWER:
${answer}

${modelAnswer ? `MODEL ANSWER (for reference):\n${modelAnswer}\n` : ""}
${rubricLines ? `RUBRIC (each point worth 1, max 3):\n${rubricLines}\n` : ""}

Grade the student's answer out of 3 points based on the rubric. Be fair but rigorous — award a point only when the answer genuinely demonstrates that part of the rubric.

Respond with ONLY a JSON object in this exact format:
{"score": <integer 0-3>, "feedback": "<one sentence of constructive feedback>"}`;

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
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenRouter error: ${response.status} ${errText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    // Extract the JSON object from the model's response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Could not parse grading response" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as { score?: unknown; feedback?: unknown };
    const score = Math.max(0, Math.min(3, Math.round(Number(parsed.score) || 0)));
    const feedback =
      typeof parsed.feedback === "string" ? parsed.feedback : "";

    return new Response(JSON.stringify({ score, feedback }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: `Grading failed: ${err instanceof Error ? err.message : String(err)}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};