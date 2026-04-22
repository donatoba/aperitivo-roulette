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
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.regularOpeningHours",
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
      return res.status(response.status).json({ error: error.error?.message || "Google API error" });
    }

    const data = await response.json();

    const spots = (data.places || []).map((place) => ({
      id: place.id,
      name: place.displayName?.text || "Unknown",
      address: place.formattedAddress || "",
      neighbourhood: "",
      vibe: ["local"],
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