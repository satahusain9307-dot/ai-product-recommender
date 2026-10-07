import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const PRODUCTS = [
  {
    id: "pixel-9a",
    name: "Google Pixel 9a",
    category: "Phone",
    price: 499,
    rating: 4.7,
    tags: ["camera", "android", "compact", "battery"],
    description: "A balanced Android phone with excellent everyday photography."
  },
  {
    id: "iphone-16e",
    name: "iPhone 16e",
    category: "Phone",
    price: 599,
    rating: 4.6,
    tags: ["ios", "camera", "battery", "compact"],
    description: "A smooth iOS experience with strong battery life and a compact design."
  },
  {
    id: "nothing-phone-3a",
    name: "Nothing Phone (3a)",
    category: "Phone",
    price: 379,
    rating: 4.5,
    tags: ["android", "value", "display", "battery"],
    description: "A stylish mid-range Android phone focused on value and a great display."
  },
  {
    id: "galaxy-a56",
    name: "Samsung Galaxy A56",
    category: "Phone",
    price: 449,
    rating: 4.5,
    tags: ["android", "display", "battery", "value"],
    description: "A dependable Samsung phone with a vivid display and long battery life."
  },
  {
    id: "macbook-air-m4",
    name: "MacBook Air M4",
    category: "Laptop",
    price: 999,
    rating: 4.9,
    tags: ["macos", "productivity", "portable", "performance"],
    description: "A lightweight laptop with excellent performance and battery life."
  },
  {
    id: "asus-zenbook-14",
    name: "ASUS Zenbook 14",
    category: "Laptop",
    price: 899,
    rating: 4.7,
    tags: ["windows", "portable", "oled", "productivity"],
    description: "A portable Windows laptop with a premium OLED display."
  },
  {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    category: "Headphones",
    price: 349,
    rating: 4.8,
    tags: ["noise-cancelling", "wireless", "travel", "music"],
    description: "Premium wireless headphones with class-leading noise cancellation."
  },
  {
    id: "anker-q30",
    name: "Soundcore Q30",
    category: "Headphones",
    price: 79,
    rating: 4.5,
    tags: ["noise-cancelling", "wireless", "value", "travel"],
    description: "Affordable wireless headphones with active noise cancellation."
  }
];

const starterPrompt = "I want a phone under $500 with a good camera and long battery life.";

function App() {
  const [preference, setPreference] = useState(starterPrompt);
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recommendedIds = useMemo(
    () => new Set(recommendations.map((item) => item.productId)),
    [recommendations]
  );

  const visibleProducts = recommendations.length
    ? PRODUCTS.filter((product) => recommendedIds.has(product.id))
    : PRODUCTS;

  async function getRecommendations(event) {
    event?.preventDefault();
    const cleanPreference = preference.trim();

    if (!cleanPreference) {
      setError("Please enter a preference first.");
      return;
    }

    setLoading(true);
    setError("");
    setReason("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: cleanPreference, products: PRODUCTS })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not get recommendations.");
      }

      setRecommendations(data.recommendations || []);
      setReason(data.reason || "These products best match your preferences.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setRecommendations([]);
    setReason("");
    setError("");
    setPreference("");
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="eyebrow">AI PRODUCT RECOMMENDER</div>
        <h1>Find the right product, faster.</h1>
        <p>
          Describe what you need in plain English. AI matches your request
          against the products in the catalog and returns the best fits.
        </p>

        <form className="search-card" onSubmit={getRecommendations}>
          <label htmlFor="preference">What are you looking for?</label>
          <textarea
            id="preference"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            placeholder='Example: "I want a phone under $500 with a good camera."'
            rows={3}
          />
          <div className="form-row">
            <span className="hint">Try budget, category, features, or use case.</span>
            <div className="actions">
              <button type="button" className="secondary" onClick={reset}>
                Reset
              </button>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? "Thinking..." : "Get recommendations →"}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="error">{error}</div>}
      </section>

      <section className="results">
        <div className="results-header">
          <div>
            <div className="eyebrow">CATALOG</div>
            <h2>{recommendations.length ? "AI recommendations" : "All products"}</h2>
          </div>
          <span className="count">{visibleProducts.length} products</span>
        </div>

        {reason && <div className="ai-reason"><strong>AI reasoning:</strong> {reason}</div>}

        <div className="product-grid">
          {visibleProducts.map((product) => {
            const rec = recommendations.find((item) => item.productId === product.id);
            return (
              <article className="product-card" key={product.id}>
                <div className="product-icon">{product.category === "Phone" ? "📱" : product.category === "Laptop" ? "💻" : "🎧"}</div>
                <div className="product-meta">
                  <span className="category">{product.category}</span>
                  <span className="rating">★ {product.rating}</span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="tags">
                  {product.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="card-bottom">
                  <strong>${product.price}</strong>
                  {rec ? <span className="match">{rec.score}% match</span> : null}
                </div>
                {rec?.reason ? <div className="match-reason">{rec.reason}</div> : null}
              </article>
            );
          })}
        </div>
      </section>

      <footer>
        Built with React + Vercel Functions + OpenAI. API keys stay server-side.
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
