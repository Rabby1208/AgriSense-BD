
const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

exports.getWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 || lat > 90 ||
      lon < -180 || lon > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude"
      });
    }

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m"
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max"
      ].join(","),
      timezone: "auto",
      forecast_days: "7"
    });

    const apiUrl = `https://api.open-meteo.com/v1/forecast?${params}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Weather provider returned ${response.status}`);
    }

    const weatherData = await response.json();

    if (!weatherData.current || !weatherData.daily) {
      throw new Error("Invalid weather provider response");
    }

    const current = weatherData.current;

    const forecast = weatherData.daily.time.map((date, index) => ({
      date,
      condition:
        weatherDescriptions[weatherData.daily.weather_code[index]] ||
        "Unknown condition",
      weather_code: weatherData.daily.weather_code[index],
      max_temperature:
        weatherData.daily.temperature_2m_max[index],
      min_temperature:
        weatherData.daily.temperature_2m_min[index],
      precipitation_probability:
        weatherData.daily.precipitation_probability_max[index]
    }));

    return res.status(200).json({
      success: true,
      location: {
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        timezone: weatherData.timezone
      },
      current: {
        temperature: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind_speed: current.wind_speed_10m,
        precipitation: current.precipitation,
        is_day: current.is_day === 1,
        weather_code: current.weather_code,
        condition:
          weatherDescriptions[current.weather_code] ||
          "Unknown condition",
        unit: weatherData.current_units
      },
      forecast,
      source: "Open-Meteo",
      attribution: "Weather data provided by Open-Meteo"
    });
  } catch (error) {
    console.error("Weather API Error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve weather information right now"
    });
  }
};
