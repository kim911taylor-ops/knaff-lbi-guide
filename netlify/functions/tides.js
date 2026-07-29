exports.handler = async function () {
  try {
    const timeZone = "America/New_York";
    const now = new Date();

    function localParts(date, includeTime = true) {
      const options = {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      };
      if (includeTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
        options.hour12 = false;
      }
      const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
      const get = type => parts.find(p => p.type === type)?.value;
      return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: includeTime ? get("hour") : null,
        minute: includeTime ? get("minute") : null
      };
    }

    const today = localParts(now);
    const futureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const future = localParts(futureDate, false);

    const beginDate = `${today.year}${today.month}${today.day}`;
    const endDate = `${future.year}${future.month}${future.day}`;
    const nowLocalText = `${today.year}-${today.month}-${today.day} ${today.hour}:${today.minute}`;

    const url = new URL("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter");
    const params = {
      begin_date: beginDate,
      end_date: endDate,
      station: "8533615",
      product: "predictions",
      datum: "MLLW",
      time_zone: "lst_ldt",
      interval: "hilo",
      units: "english",
      application: "TheKnaffGuide",
      format: "json"
    };

    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NOAA tides returned ${response.status}`);
    }

    const data = await response.json();
    const allUpcoming = (data.predictions || []).filter(
      prediction => prediction.t > nowLocalText
    );

    // Find the next upcoming high and the next upcoming low.
    const nextHigh = allUpcoming.find(prediction => prediction.type === "H");
    const nextLow = allUpcoming.find(prediction => prediction.type === "L");

    // Display them in chronological order.
    const predictions = [nextHigh, nextLow]
      .filter(Boolean)
      .sort((a, b) => a.t.localeCompare(b.t));

    return jsonResponse(200, {
      station: "Barnegat Inlet",
      predictions,
      currentLocalTime: nowLocalText
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
      "Cache-Control": "public, max-age=300"
    },
    body: JSON.stringify(body)
  };
}
