import { useState } from "react";
import { spots, vibes } from "./data/spots";

const vibeEmoji = {
  classic: "🏛️",
  trendy: "✨",
  rooftop: "🌆",
  canal: "🛶",
  cocktails: "🍸",
  wine: "🍷",
  local: "🧡",
  hipster: "🎨",
  outdoor: "🌿",
  cozy: "🕯️",
};

function SpinButton({ onClick, spinning }) {
  return (
    <button onClick={onClick} disabled={spinning} className="spin-btn">
      {spinning ? (
        <span className="spinning-text">Spinning...</span>
      ) : (
        "Spin 🎲"
      )}
    </button>
  );
}

function VibeTag({ vibe, small }) {
  return (
    <span className={`vibe-tag ${small ? "vibe-tag-small" : ""}`}>
      {vibeEmoji[vibe]} {vibe}
    </span>
  );
}

export default function App() {
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [noResults, setNoResults] = useState(false);

  function toggleVibe(vibe) {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
    setNoResults(false);
  }

  function spin() {
    const filtered =
      selectedVibes.length === 0
        ? spots
        : spots.filter((s) => selectedVibes.some((v) => s.vibe.includes(v)));

    if (filtered.length === 0) {
      setNoResults(true);
      return;
    }

    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const pick = filtered[Math.floor(Math.random() * filtered.length)];
      setResult(pick);
      setSpinning(false);
    }, 900);
  }

  function reset() {
    setResult(null);
    setNoResults(false);
  }

  function goToMaps() {
    window.open(result.mapsUrl, "_blank", "noopener,noreferrer");
  }

  if (result) {
    return (
      <div className="app-container">
        <div className="result-screen">
          <div className="result-eyebrow">Tonight's aperitivo 🥂</div>

          <div className="result-card">
            <div className="result-neighbourhood">{result.neighbourhood}</div>
            <h1 className="result-name">{result.name}</h1>
            <p className="result-address">{result.address}</p>

            <div className="result-vibes">
              {result.vibe.map((v) => (
                <VibeTag key={v} vibe={v} small />
              ))}
            </div>
          </div>

          <button onClick={goToMaps} className="cta-btn">
            Take me there
          </button>

          <button onClick={reset} className="secondary-btn">
            Spin again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="home-screen">
        <div className="header">
          <div className="header-eyebrow">Milano</div>
          <h1 className="header-title">
            Aperitivo
            <br />
            Roulette
          </h1>
          <p className="header-sub">Can't decide? Let fate pick your bar.</p>
        </div>

        <div className="vibe-section">
          <p className="vibe-label">
            Filter by vibe <span>(optional)</span>
          </p>
          <div className="vibe-grid">
            {vibes.map((vibe) => (
              <button
                key={vibe}
                onClick={() => toggleVibe(vibe)}
                className={`vibe-pill ${
                  selectedVibes.includes(vibe) ? "vibe-pill-active" : ""
                }`}
              >
                {vibeEmoji[vibe]} {vibe}
              </button>
            ))}
          </div>
          {selectedVibes.length > 0 && (
            <button onClick={() => setSelectedVibes([])} className="clear-btn">
              clear filters
            </button>
          )}
        </div>

        {noResults && (
          <p className="no-results">
            No spots match that combo. Try fewer filters!
          </p>
        )}

        <div className="spin-container">
          <SpinButton onClick={spin} spinning={spinning} />
          <p className="spin-hint">
            {selectedVibes.length === 0
              ? `${spots.length} spots across Milan`
              : `${
                  spots.filter((s) =>
                    selectedVibes.some((v) => s.vibe.includes(v))
                  ).length
                } spots match`}
          </p>
        </div>
      </div>
    </div>
  );
}