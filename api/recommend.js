import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { preference, products } = req.body || {};

    if (!preference || !Array.isArray(products)) {
      return res.status(400).json({
        error: "Preference and products are required",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [
        {
          role: "system",
          content:
            "You are a product recommendation assistant. Recommend only products from the provided catalog. Return valid JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            preference,
            products,
            required_format: {
              recommendations: [
                {
                  productId: "string",
                  score: 0,
                  reason: "string",
                },
              ],
              reason: "string",
            },
          }),
        },
      ],
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Recommendation error:", error);

    return res.status(500).json({
      error: error.message || "Recommendation failed",
    });
  }
}
