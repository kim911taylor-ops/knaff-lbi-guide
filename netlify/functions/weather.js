exports.handler = async function () {
  try {
    // Surf City, NJ 08008
    const lat = 39.6740;
    const lon = -74.1570;
    const headers = {
      "User-Agent": "TheKnaffGuide/1.5 (Surf City NJ visitor guide)",
      "Accept": "application/geo+json"
    };

    const pointResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
    if (!pointResponse.ok) throw new Error(`NWS point lookup ${pointResponse.status}`);
    const point = await pointResponse.json();

    const [forecast, hourly] = await Promise.all([
      fetch(point.properties.forecast, { headers }).then(r => {
        if (!r.ok) throw new Error(`NWS forecast ${r.status}`);
        return r.json();
      }),
      fetch(point.properties.forecastHourly, { headers }).then(r => {
        if (!r.ok) throw new Error(`NWS hourly ${r.status}`);
        return r.json();
      })
    ]);

    const now = hourly.properties.periods[0];
    const todayPeriods = forecast.properties.periods.slice(0, 2);
    const daytime = todayPeriods.find(p => p.isDaytime) || todayPeriods[0];
    const tonight = todayPeriods.find(p => !p.isDaytime) || todayPeriods[1];

    return jsonResponse(200, {
      location: "Surf City, NJ 08008",
      current: {
        temperature: now.temperature,
        unit: now.temperatureUnit,
        text: now.shortForecast,
        wind: `${now.windSpeed} ${now.windDirection}`,
        humidity: now.relativeHumidity?.value == null ? null : Math.round(now.relativeHumidity.value),
        dewpointC: now.dewpoint?.value ?? null,
        probabilityOfPrecipitation: now.probabilityOfPrecipitation?.value ?? null,
        icon: now.icon
      },
      today: {
        high: daytime?.temperature ?? null,
        low: tonight?.temperature ?? null,
        summary: daytime?.shortForecast ?? now.shortForecast
      },
      updated: hourly.properties.updateTime
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
      "Cache-Control": "public, max-age=600"
    },
    body: JSON.stringify(body)
  };
}
