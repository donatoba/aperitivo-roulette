import { useState, useEffect } from "react";
import { spots as staticSpots, vibes } from "./data/spots";

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
      {vibeEmoji[vibe] || "📍"} {vibe}
    </span>
  );
}

function SourceBadge({ source }) {
  return (
    <div className={`source-badge ${source === "google" ? "source-live" : "source-static"}`}>
      {source === "google" ? "📡 Live from Google Places" : "📋 Curated list"}
    </div>
  );
}

export default function App() {
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [spots, setSpots] = useState(staticSpots);
  const [source, setSource] = useState("static");
  const [locationStatus, setLocationStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect fired");

    if (!navigator.geolocation) {
      console.log("geolocation not available");
      setLocationStatus("unavailable");
      return;
    }

    console.log("requesting location...");
    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("got position", position.coords);
        const { latitude, longitude } = position.coords;
        setLocationStatus("fetching");

        try {
          const res = await fetch(
            `/api/spots?lat=${latitude}&lng=${longitude}`
          );
          console.log("API response status", res.status);

          if (!res.ok) throw new Error("API error");

          const data = await res.json();
          console.log("spots returned", data.spots?.length);

          if (data.spots && data.spots.length > 0) {
            setSpots(data.spots);
            setSource("google");
            setLocationStatus("success");
          } else {
            throw new Error("No spots returned");
          }
        } catch (err) {
          console.log("fetch error", err);
          setSource("static");
          setLocationStatus("fallback");
          setError("Couldn't load live spots — showing our curated list instead.");
        }
      },
      (err) => {
        console.log("geolocation error", err.code, err.message);
        setSource("static");
        setLocationStatus("fallback");
        setError("Location access denied — showing our curated list instead.");
      }
    );
  }, []);

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
            <div className="result-neighbourhood">
              {result.neighbourhood || result.address?.split(",")[1]?.trim() || "Milano"}
            </div>
            <h1 className="result-name">{result.name}</h1>
            <p className="result-address">{result.address}</p>

            {result.rating && (
              <p className="result-rating">
                ⭐ {result.rating} ({result.userRatingCount} reviews)
                {result.isOpen === true && <span className="open-badge"> · Open now</span>}
                {result.isOpen === false && <span className="closed-badge"> · Closed</span>}
              </p>
            )}

            <div className="result-vibes">
              {result.vibe.map((v) => (
                <VibeTag key={v} vibe={v} small />
              ))}
            </div>
          </div>

          <SourceBadge source={source} />

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

        {locationStatus === "loading" || locationStatus === "fetching" ? (
          <div className="status-banner status-loading">
            📡 Finding bars near you...
          </div>
        ) : locationStatus === "success" ? (
          <div className="status-banner status-success">
            📍 Showing bars within 1.5km of you
          </div>
        ) : locationStatus === "fallback" ? (
          <div className="status-banner status-fallback">
            {error}
          </div>
        ) : null}

        {source === "google" ? null : (
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
        )}

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