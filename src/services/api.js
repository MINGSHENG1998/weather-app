import services from "./index.js";
import { encodeQueryParams } from "./../util/common";

const apiKey = import.meta.env?.VITE_WEATHER_API_KEY;

const api = {
  get: {
    weather: {
      autoComplete: (params) =>
        services.weather.get(
          `/geo/1.0/direct${encodeQueryParams(
            params
          )}&callback=test&appid=${apiKey}`
        ),
      current: (params) =>
        services.weather.get(
          `/data/2.5/weather${encodeQueryParams(
            params
          )}&callback=test&appid=${apiKey}`
        ),
    },
    country: {
      search: (params) => services.country.get(`name/${params.name}`),
      all: () => services.country.get("all"),
    },
  },
};

export default api;
