import { useCallback, useState, useContext } from "react";

import api from "./services/api";
import {
  debounce,
  formatDateTime,
  convertWeatherApiResponse,
} from "./util/common";
import { ThemeContext } from "./contexts/theme-context";

function App() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchWeather = useCallback(async (cityName, countryName = "") => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.get.weather.current({
        q: countryName ? `${cityName},${countryName}` : cityName,
        units: "metric",
      });
      res.data = convertWeatherApiResponse(res.data);
      setWeatherData(res.data);

      setHistory((prev) => {
        const newItem = {
          city: cityName,
          country: countryName || res.data.sys?.country,
          dateTime: formatDateTime(new Date()),
          weather: res.data.weather?.[0]?.main || "Unknown Weather",
          id: "TW" + Date.now() + Math.random(),
        };

        const updated = prev.filter(
          (item) =>
            `${item.city},${item.country}`.toLowerCase() !==
            `${cityName},${countryName || res.data?.sys?.country}`.toLowerCase()
        );

        return [newItem, ...updated].slice(0, 5);
      });
    } catch (err) {
      console.error("Weather fetch error:", err);
      setWeatherData(null);
      const errMsg =
        err.response?.status === 404
          ? "City not found."
          : "Server error. Try again later.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (param) => {
      if (!param.trim() || param.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await api.get.weather.autoComplete({
          q: param,
          limit: 5, //max 5
        });
        res.data = convertWeatherApiResponse(res.data);
        setSuggestions(
          res.data?.map((item) => ({
            city: item.name,
            country: item.country,
          }))
        );
      } catch (err) {
        setSuggestions([]);
      }
      //change if lag
    }, 400),
    []
  );

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (city.trim()) {
      fetchWeather(city, country);
      setShowSuggestions(false);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setErrorMsg(null);

    if (value.length >= 2) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.city);
    setCountry(suggestion.country);
    setShowSuggestions(false);
    fetchWeather(suggestion.city, suggestion.country);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearForm = () => {
    setCity("");
    setCountry("");
    setWeatherData(null);
    setErrorMsg(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // handlers for history list
  const handleHistoryClick = (item) => {
    setCity(item.city);
    setCountry(item.country);
    fetchWeather(item.city, item.country);
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 dark:text-white transition-all duration-300">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">
              Today's Weather
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="cursor-pointer px-6 py-3 rounded-full font-medium bg-gray-800 text-white hover:bg-gray-700 dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-400"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        <main className="rounded-2xl shadow-lg p-6 sm:p-8 bg-white/80 border border-white/20 dark:bg-gray-800/80 dark:border-gray-700">
          <div className="space-y-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="City name..."
                  className="w-full p-4 rounded-xl border-2 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/25 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                  required
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 rounded-xl shadow-lg bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:rounded-xl">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="cursor-pointer w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white hover:rounded-xl"
                      >
                        <span className="font-medium">{suggestion.city}</span>,{" "}
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {suggestion.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:w-1/3">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country (optional)"
                  className="w-full p-4 rounded-xl border-2 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/25 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || !city.trim()}
                onClick={handleSubmit}
                className="flex-1 py-4 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  "Search Weather"
                )}
              </button>

              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-4 rounded-xl font-semibold bg-gray-500 cursor-pointer hover:bg-gray-600 text-white"
              >
                Clear
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <span>Error: {errorMsg}</span>
            </div>
          )}

          {weatherData && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 dark:from-blue-600/20 dark:to-purple-600/20 dark:border-blue-500/30">
              <div className="text-center">
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    {weatherData.name}
                    {weatherData.sys?.country && (
                      <span className="text-lg font-normal ml-2 text-gray-600 dark:text-gray-300">
                        {weatherData.sys.country}
                      </span>
                    )}
                  </h2>
                  {weatherData.weather?.[0]?.main && (
                    <p className="text-lg capitalize text-gray-600 dark:text-gray-300">
                      {weatherData.weather?.[0]?.main}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-700/50">
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round(weatherData.main?.temp || 0)}°C
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(((weatherData.main?.temp || 0) * 9) / 5 + 32)}
                      °F
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-700/50">
                    <div className="text-2xl font-bold text-purple-600">
                      {weatherData.main?.humidity || 0}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Humidity
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-700/50">
                    <div className="text-lg font-semibold text-green-600">
                      {formatDateTime(new Date())}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last Updated
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Recent Searches</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="cursor-pointer text-red-500 hover:text-red-400 font-medium"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No recent searches</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                  >
                    <button
                      onClick={() => handleHistoryClick(item)}
                      className="flex flex-1 text-left"
                    >
                      <div className="items-center gap-3">
                        <div className="font-medium hover:text-blue-600">
                          {item.city}, {item.country}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.weather}
                        </div>
                      </div>
                      <div className="content-center ml-auto items-center gap-3">
                        <div className="font-medium text-gray-500 dark:text-gray-400">
                          {item.dateTime}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="ml-4 p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      aria-label={`Delete ${item.city} from history`}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 Today's Weather. All rights reserved.</p>
          <p>
            Built by{" "}
            <a
              href="https://khaw-ming-sheng-cv.web.app/"
              className="text-blue-500 hover:underline"
            >
              Khaw Ming Sheng
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
