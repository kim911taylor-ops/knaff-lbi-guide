exports.handler = async function () {
  try {
    const lat = 39.6740;
    const lon = -74.1570;
    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
    if (!response.ok) throw new Error(`Sunrise service ${response.status}`);
    const data = await response.json();

    const formatLocal = iso => new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(iso));

    return jsonResponse(200, {
      sunrise: formatLocal(data.results.sunrise),
      sunset: formatLocal(data.results.sunset),
      solarNoon: formatLocal(data.results.solar_noon)
    });
  } catch (error) {
    return jsonResponse(500, { error: error.message });
  }
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=21600"
    },
    body: JSON.stringify(body)
  };
}
