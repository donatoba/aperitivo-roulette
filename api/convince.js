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

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Anthropic API key not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "interleaved-thinking-2025-05-14",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          },
        ],
        messages: [
          {
            role: "user",
            content: `You are helping users of an aperitivo bar discovery app called Aperitivo Roulette.

A user has been matched with "${name}" at "${address}" in Milan, Italy.

Please do two things:
1. Search the web to find what "${name}" in Milan is genuinely famous or notable for — its history, a famous drink it invented, a celebrity connection, the view, the neighbourhood vibe, or anything that makes it special. If it's not a famous bar, find something interesting about its neighbourhood or style.
2. Write a short witty joke related to drinking, aperitivo, or Italian bar culture to entertain the user while they wait.

Respond ONLY with a JSON object in this exact format, no preamble, no markdown:
{
  "story": "one compelling sentence about what makes this bar special, written to convince someone to go tonight",
  "joke": "a short witty joke about drinking, aperitivo, or Italian bar culture"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: error.error?.message || "Anthropic API error",
      });
    }

    const data = await response.json();

    const textBlock = data.content.find((block) => block.type === "text");
    if (!textBlock) {
      throw new Error("No text response from Claude");
    }

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
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