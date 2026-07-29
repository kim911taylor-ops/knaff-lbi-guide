
exports.handler = async function () {
  try {
    const lat = 39.6621, lon = -74.1651;
    const headers = { "User-Agent": "TheKnaffGuide/1.0 contact via site", "Accept": "application/geo+json" };
    const point = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {headers}).then(r => {
      if (!r.ok) throw new Error(`NWS points ${r.status}`);
      return r.json();
    });
    const [forecast, hourly] = await Promise.all([
      fetch(point.properties.forecast, {headers}).then(r=>r.json()),
      fetch(point.properties.forecastHourly, {headers}).then(r=>r.json())
    ]);
    const now = hourly.properties.periods[0];
    const today = forecast.properties.periods[0];
    return response(200, {
      current: {temperature: now.temperature, unit: now.temperatureUnit, text: now.shortForecast, wind: `${now.windSpeed} ${now.windDirection}`, icon: now.icon},
      today: {name: today.name, high: today.temperature, unit: today.temperatureUnit, text: today.shortForecast},
      updated: hourly.properties.updateTime
    });
  } catch (e) { return response(500, {error:e.message}); }
}
function response(statusCode, body){ return {statusCode, headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=600"}, body:JSON.stringify(body)}; }
