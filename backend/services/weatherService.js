import axios from "axios";
import cache from "../utils/cache.js";
import logger from "../utils/logger.js";

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getWeatherByLocation = async (location) => {
  try {
    // Read API key at runtime (after dotenv has loaded)
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

    if (!WEATHER_API_KEY) {
      logger.error("Weather API key is missing!");
      return null;
    }

    logger.info(
      `Fetching weather for location: ${location} (API key configured: Yes)`
    );

    // Check cache first
    const cacheKey = `weather:${location.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Weather cache hit for: ${location}`);
      return cached;
    }

    // Try different location formats
    const locationFormats = [
      location, // Original format
      `${location}, PH`, // Try with Philippines country code
      `${location}, Philippines`, // Try with full country name
    ];

    let lastError = null;
    for (const locationFormat of locationFormats) {
      try {
        logger.debug(
          `Trying weather API with location format: "${locationFormat}"`
        );
        const response = await axios.get(WEATHER_API_URL, {
          params: {
            q: locationFormat,
            appid: WEATHER_API_KEY,
            units: "metric", // Celsius
          },
          timeout: 5000, // 5 second timeout
        });

        logger.debug(
          `Weather API success for "${locationFormat}": ${response.status}`
        );

        const weatherData = {
          temperature: Math.round(response.data.main.temp),
          condition: response.data.weather[0].main,
          description: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind?.speed || 0,
          icon: response.data.weather[0].icon,
        };

        // Cache the result with original location key
        cache.set(cacheKey, weatherData, CACHE_TTL);
        logger.debug(
          `Weather data cached for: ${location} (found as: ${locationFormat})`
        );

        return weatherData;
      } catch (error) {
        lastError = error;
        // If it's a 404 (city not found), try next format
        // If it's a different error (API key, rate limit, etc), log and break
        if (error.response?.status === 404) {
          logger.debug(
            `Location format "${locationFormat}" not found, trying next...`
          );
          continue;
        } else {
          // For other errors (401, 429, etc), log and break
          logger.error(`Weather API error for "${locationFormat}":`, {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
          });
          break;
        }
      }
    }

    // If all formats failed, log the last error with more details
    if (lastError) {
      const errorDetails = {
        location,
        status: lastError.response?.status,
        statusText: lastError.response?.statusText,
        message: lastError.response?.data?.message || lastError.message,
        cod: lastError.response?.data?.cod, // OpenWeatherMap error code
      };

      // Check for specific error types
      if (lastError.response?.status === 401) {
        logger.error(
          `Weather API authentication failed. Check WEATHER_API_KEY:`,
          errorDetails
        );
      } else if (lastError.response?.status === 429) {
        logger.error(`Weather API rate limit exceeded:`, errorDetails);
      } else if (lastError.response?.status === 404) {
        logger.warn(
          `Weather API: Location not found after trying all formats:`,
          errorDetails
        );
      } else {
        logger.error(
          `Weather API failed for all location formats:`,
          errorDetails
        );
      }
    } else {
      logger.warn(
        `Weather API failed for location "${location}" but no error was captured`
      );
    }
    return null;
  } catch (error) {
    logger.error("Weather API error:", {
      location,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return null;
  }
};

export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    // Read API key at runtime (after dotenv has loaded)
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

    if (!WEATHER_API_KEY) {
      logger.warn("Weather API key not configured");
      return null;
    }

    // Check cache first
    const cacheKey = `weather:${lat},${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Weather cache hit for coordinates: ${lat},${lon}`);
      return cached;
    }

    const response = await axios.get(WEATHER_API_URL, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: "metric",
      },
    });

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind?.speed || 0,
      icon: response.data.weather[0].icon,
    };

    // Cache the result
    cache.set(cacheKey, weatherData, CACHE_TTL);
    logger.debug(`Weather data cached for coordinates: ${lat},${lon}`);

    return weatherData;
  } catch (error) {
    logger.error("Weather API error:", error.message);
    return null;
  }
};

export const getStyleSuggestions = (weather, occasion, clothingItems = []) => {
  const suggestions = [];
  const temperature = weather?.temperature || 20;
  const condition = weather?.condition?.toLowerCase() || "clear";
  const humidity = weather?.humidity || 50;

  // Analyze available clothing items
  const hasOuterwear = clothingItems.some(
    (item) =>
      item.category === "outerwear" ||
      item.tags?.some((tag) =>
        ["jacket", "coat", "blazer", "cardigan"].includes(tag.toLowerCase())
      )
  );
  const hasWarmItems = clothingItems.some((item) =>
    item.tags?.some((tag) =>
      ["wool", "fleece", "thermal", "sweater"].includes(tag.toLowerCase())
    )
  );
  const hasLightItems = clothingItems.some((item) =>
    item.tags?.some((tag) =>
      ["cotton", "linen", "breathable", "light"].includes(tag.toLowerCase())
    )
  );

  // Temperature-based suggestions with clothing analysis
  if (temperature < 5) {
    suggestions.push("Very cold - Layer up with multiple warm pieces");
    if (!hasOuterwear) {
      suggestions.push("Consider adding a heavy coat or jacket");
    }
    if (!hasWarmItems) {
      suggestions.push("Add thermal layers or wool items for extra warmth");
    }
    suggestions.push("Don't forget gloves, scarf, and warm hat");
    suggestions.push("Waterproof boots with insulation recommended");
  } else if (temperature < 10) {
    suggestions.push("Cold weather - Wear a warm coat or heavy jacket");
    if (hasWarmItems) {
      suggestions.push("Your warm items are perfect for this weather");
    }
    suggestions.push("Layer with sweaters or cardigans");
    suggestions.push("Closed-toe shoes or boots recommended");
  } else if (temperature < 15) {
    suggestions.push("Cool weather - Light to medium jacket recommended");
    suggestions.push("Long sleeves and layers work well");
    if (hasLightItems) {
      suggestions.push("You can mix light and medium layers");
    }
  } else if (temperature < 20) {
    suggestions.push("Mild weather - Light jacket or cardigan optional");
    suggestions.push("Long or short sleeves both work");
    suggestions.push("Jeans or light pants comfortable");
  } else if (temperature < 25) {
    suggestions.push("Pleasant weather - Light, comfortable clothing");
    if (hasLightItems) {
      suggestions.push("Your light fabrics are perfect for today");
    }
    suggestions.push("Short sleeves or light long sleeves");
    suggestions.push("Comfortable shoes for walking");
  } else if (temperature < 30) {
    suggestions.push("Warm weather - Light, breathable fabrics");
    suggestions.push("Short sleeves and light colors recommended");
    suggestions.push("Shorts or light pants would be comfortable");
    suggestions.push("Sun protection: hat and sunglasses");
    if (humidity > 70) {
      suggestions.push("High humidity - Choose moisture-wicking fabrics");
    }
  } else {
    suggestions.push("Hot weather - Very light, breathable clothing essential");
    suggestions.push("Short sleeves, tank tops, or sleeveless");
    suggestions.push("Shorts or very light pants");
    suggestions.push("Sun protection is crucial - hat, sunglasses, sunscreen");
    suggestions.push("Stay hydrated and choose light colors");
    if (humidity > 70) {
      suggestions.push(
        "High humidity - Avoid heavy fabrics, choose cotton or linen"
      );
    }
  }

  // Weather condition-based suggestions
  if (condition.includes("rain") || condition.includes("drizzle")) {
    suggestions.push("Rainy weather - Waterproof outerwear essential");
    suggestions.push("Bring an umbrella or wear a raincoat");
    suggestions.push("Waterproof or water-resistant footwear");
    suggestions.push("Avoid suede, leather, and delicate fabrics");
    suggestions.push("Protect bags and electronics");
  } else if (condition.includes("snow")) {
    suggestions.push("Snowy weather - Warm, insulated layers");
    suggestions.push("Heavy winter coat with insulation");
    suggestions.push("Waterproof boots with good traction");
    suggestions.push("Gloves, hat, and scarf essential");
    suggestions.push("Waterproof or water-resistant pants if possible");
  } else if (condition.includes("wind")) {
    suggestions.push("Windy conditions - Secure your accessories");
    suggestions.push("Windbreaker or light jacket recommended");
    suggestions.push("Avoid loose hats or accessories");
    suggestions.push("Avoid very loose or flowy clothing");
  } else if (condition.includes("cloud") || condition.includes("overcast")) {
    suggestions.push("Cloudy skies - Temperature may feel cooler");
    suggestions.push("Light layer recommended even if temperature seems warm");
  }

  // Occasion-based suggestions
  if (occasion === "formal") {
    suggestions.push("Formal occasion - Dress appropriately");
    suggestions.push("Consider suit or dress code requirements");
    suggestions.push("Formal footwear required");
    if (temperature < 15) {
      suggestions.push("Formal coat or blazer for outdoor portions");
    }
  } else if (occasion === "sporty" || occasion === "workout") {
    suggestions.push("Active wear - Comfortable, moisture-wicking fabrics");
    suggestions.push("Athletic shoes essential");
    suggestions.push("Stay hydrated during activity");
    if (temperature > 25) {
      suggestions.push("Light, breathable athletic wear");
    } else if (temperature < 15) {
      suggestions.push("Light athletic jacket for warm-up");
    }
  } else if (occasion === "party") {
    suggestions.push("Party time - Dress to impress while staying comfortable");
    if (temperature < 15) {
      suggestions.push("Bring a stylish jacket or coat for outdoor areas");
    }
  } else if (occasion === "work") {
    suggestions.push("Professional attire appropriate");
    suggestions.push("Consider office dress code");
    if (temperature > 25) {
      suggestions.push("Light, professional fabrics for comfort");
    }
  }

  // General tips
  if (suggestions.length === 0) {
    suggestions.push("Perfect weather for your favorite outfit!");
  }

  return suggestions;
};
