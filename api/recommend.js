import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function fallbackRecommendations(preference, products) {
  const text = preference.toLowerCase();
  const budgetMatch = text.match(/(?:under|below|less than|max(?:imum)?|budget(?: of)?)\s*\$?\s*(\d+)/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  const category = ["phone", "laptop", "headphones"].find((item) => text.includes(item));
  const requestedTags = products
    .flatMap((p) => p.tags)
    .filter((tag, index, arr) => arr.indexOf(tag) === index && text.includes(tag));

  const ranked = products
    .filter((p) => !category || p.category.toLowerCase() === category)
    .filter((p) => budget === null || p.price <= budget)
    .map((p) => {
      const tagHits = requestedTags.filter((tag) => p.tags.includes(tag)).length;
      const score = Math.min(99, Math.round(65 + tagHits * 10 + p.rating * 3));
      return {
        productId: p.id,
        score,
        reason: tagHits ? `Matches ${tagHits} requested feature${tagHits > 1 ? "s" : ""} and fits the stated constraints.` : "Fits the stated category and constraints."
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return {
    recommendations: ranked.length ? ranked : products.slice(0, 3).map((p) => ({
      productId: p.id,
      score: 70,
      reason: "A general fallback recommendation from the available catalog."
    })),
    reason: "Fallback matching was used because an AI API key is not configured."
  };
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const body = await request.json();
    const preference = typeof body.preference === "string" ? body.preference.trim() : "";
    const products = Array.isArray(body.products) ? body.products : [];

    if (!preference) {
      return Response.json({ error: "Preference is required." }, { status: 400 });
    }
    if (!products.length) {
      return Response.json({ error: "Product catalog is empty." }, { status: 400 });
    }

    // Keep the demo usable locally even before an OpenAI key is added.
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(fallbackRecommendations(preference, products));
    }

    const catalog = products.map(({ id, name, category, price, rating, tags, description }) => ({
      id, name, category, price, rating, tags, description
    }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [
        {
          role: "system",
          content: `You are a product recommendation engine. Only recommend products from the supplied catalog.
Return strict JSON with this shape:
{
  "recommendations": [
    { "productId": "catalog-id", "score": 0, "reason": "short reason" }
  ],
  "reason": "one short overall explanation"
}
Rules: recommend at most 4 products; score is an integer from 0 to 100; never invent product IDs; prioritize explicit budget/category/features; if no exact match exists, return the closest valid catalog items.`
        },
        {
          role: "user",
          content: `User preference: ${preference}\n\nCatalog:\n${JSON.stringify(catalog)}`
        }
      ]
    });

    const raw = response.output_text?.trim() || "";
    const parsed = JSON.parse(raw);

    const validIds = new Set(products.map((p) => p.id));
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter((item) => validIds.has(item.productId))
          .slice(0, 4)
          .map((item) => ({
            productId: item.productId,
            score: Math.max(0, Math.min(100, Number(item.score) || 0)),
            reason: String(item.reason || "Good match for the requested preferences.")
          }))
      : [];

    return Response.json({
      recommendations,
      reason: String(parsed.reason || "These products best match the stated preferences.")
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return Response.json(
      { error: "Recommendation service failed. Check the server logs and API configuration." },
      { status: 500 }
    );
  }
}
