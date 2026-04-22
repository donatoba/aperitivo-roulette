function inferVibes(place) {
  const vibes = [];
  const name = (place.displayName?.text || "").toLowerCase();
  const types = place.types || [];
  const rating = place.rating || 0;
  const userRatingCount = place.userRatingCount || 0;

  // wine
  if (
    name.includes("vino") ||
    name.includes("wine") ||
    name.includes("enoteca") ||
    name.includes("vineria") ||
    name.includes("cantina") ||
    types.includes("wine_bar")
  ) {
    vibes.push("wine");
  }

  // cocktails
  if (
    name.includes("cocktail") ||
    name.includes("mixer") ||
    name.includes("lab") ||
    name.includes("speakeasy") ||
    name.includes("aperitivo") ||
    name.includes("negroni") ||
    name.includes("spritz") ||
    types.includes("cocktail_bar")
  ) {
    vibes.push("cocktails");
  }

  // hipster
  if (
    name.includes("botanical") ||
    name.includes("craft") ||
    name.includes("brew") ||
    name.includes("birrificio") ||
    name.includes("artigianale") ||
    types.includes("brewery")
  ) {
    vibes.push("hipster");
  }

  // classic
  if (
    name.includes("caffè") ||
    name.includes("caffe") ||
    name.includes("café") ||
    name.includes("bar ") ||
    name.startsWith("bar") ||
    name.includes("tavern") ||
    name.includes("osteria")
  ) {
    vibes.push("classic");
  }

  // trendy — high rating and many reviews
  if (rating >= 4.5 && userRatingCount >= 100) {
    vibes.push("trendy");
  }

  // local — decent rating, many reviews = well known locally
  if (rating >= 4.0 && userRatingCount >= 50) {
    vibes.push("local");
  }

  // cozy — lower review count but good rating = hidden gem
  if (rating >= 4.2 && userRatingCount < 100) {
    vibes.push("cozy");
  }

  // fallback — always have at least one vibe
  if (vibes.length === 0) {
    vibes.push("local");
  }

  return vibes;
}

export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat/lng parameters" });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.regularOpeningHours,places.types",
        },
        body: JSON.stringify({
          includedTypes: ["bar"],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
              },
              radius: 1500.0,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: error.error?.message || "Google API error",
      });
    }

    const data = await response.json();

    const spots = (data.places || []).map((place) => ({
      id: place.id,
      name: place.displayName?.text || "Unknown",
      address: place.formattedAddress || "",
      neighbourhood: place.formattedAddress?.split(",")[1]?.trim() || "Milano",
      vibe: inferVibes(place),
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      isOpen: place.regularOpeningHours?.openNow,
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(
        place.displayName?.text + " " + place.formattedAddress
      )}`,
    }));

    return res.status(200).json({ spots, source: "google" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch from Google Places" });
  }
}