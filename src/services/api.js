import services from "./index.js";
import { encodeQueryParams } from "./../util/common";

const apiKey = import.meta.env?.VITE_WEATHER_API_KEY;

const api = {
  get: {
    weather: {
      autoComplete: (params) =>
        services.get(
          `/geo/1.0/direct${encodeQueryParams(
            params
          )}&callback=test&appid=${apiKey}`
        ),
      current: (params) =>
        services.get(
          `/data/2.5/weather${encodeQueryParams(
            params
          )}&callback=test&appid=${apiKey}`
        ),
    },
  },
};

export default api;
