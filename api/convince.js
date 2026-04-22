const cache = {};

export default async function handler(req, res) {
  const { name, address } = req.query;

  if (!name || !address) {
    return res.status(400).json({ error: "Missing name or address" });
  }

  const cacheKey = `${name}__${address}`;
  if (cache[cacheKey]) {
    return res.status(200).json(cache[cacheKey]);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are helping users of an aperitivo bar discovery app called Aperitivo Roulette in Milan, Italy.

A user has been matched with "${name}" at "${address}" in Milan.

Do two things:
1. Think about what "${name}" in Milan is genuinely famous or notable for — its history, a famous drink it invented, a celebrity connection, the view, the neighbourhood vibe, or anything that makes it special. If it's not a famous bar, say something interesting about its style or neighbourhood.
2. Write a short witty joke related to drinking, aperitivo, or Italian bar culture.

Respond ONLY with a valid JSON object in this exact format, no preamble, no markdown, no backticks:
{"story":"one compelling sentence about what makes this bar special, written to convince someone to go tonight","joke":"a short witty joke about drinking, aperitivo, or Italian bar culture"}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: error.error?.message || "Gemini API error",
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text response from Gemini");
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    cache[cacheKey] = parsed;

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to generate story",
      story: "A hidden gem worth discovering tonight.",
      joke: "Why do Italians make the best bartenders? Because they know how to make everything a little more spritz-tacular.",
    });
  }
}