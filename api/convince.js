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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                  text: `You are a helpful assistant for an aperitivo bar app in Milan.

For the bar "${name}" at "${address}" in Milan, write two things:
STORY: one compelling sentence about what makes this bar special tonight
JOKE: one short witty joke about aperitivo or Italian bar culture

Use exactly this format:
STORY: your sentence here
JOKE: your joke here`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
            thinkingConfig: {
              thinkingBudget: 0,
            },
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
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter((p) => p.text && !p.thought)
      .map((p) => p.text)
      .join("")
      .trim();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const storyMatch = text.match(/STORY:\s*(.+)/);
    const jokeMatch = text.match(/JOKE:\s*(.+)/);

    const result = {
      story: storyMatch?.[1]?.trim() || "A legendary Milan aperitivo spot worth discovering tonight.",
      joke: jokeMatch?.[1]?.trim() || "Why do Italians make the best bartenders? They know how to make everything a little more spritz-tacular.",
    };

    cache[cacheKey] = result;
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({
      error: err.message,
      story: "A legendary Milan aperitivo spot worth discovering tonight.",
      joke: "Why do Italians make the best bartenders? They know how to make everything a little more spritz-tacular.",
    });
  }
}