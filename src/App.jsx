import { useCallback, useState, useContext, useEffect } from "react";

import AppButton from "./components/app-button";
import AppInput from "./components/app-input";
import { ThemeContext } from "./contexts/theme-context";
import api from "./services/api";
import {
  debounce,
  formatDateTime,
  convertWeatherApiResponse,
} from "./util/common";

function App() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [form, setForm] = useState({ city: "", country: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  //cityList
  const [cityList, setCityList] = useState([]);
  const [showCityList, setShowCityList] = useState(false);
  //country list
  const [countryList, setCountryList] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showCountryList, setShowCountryList] = useState(false);

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
          ? "Result not found. Please try again"
          : "Server error. Try again later.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
      setShowCityList(false);
    }
  }, []);

  const fetchcityList = useCallback(
    debounce(async (param) => {
      if (!param.trim() || param.length < 2) {
        setCityList([]);
        return;
      }
      try {
        const res = await api.get.weather.autoComplete({
          q: param,
          limit: 5, //max 5
        });
        res.data = convertWeatherApiResponse(res.data);
        setCityList(
          res.data?.map((item) => ({
            city: item.name,
            country: item.country,
          }))
        );
      } catch (err) {
        setCityList([]);
      }
      //change if lag
    }, 400),
    []
  );

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (form.city.trim()) {
      fetchWeather(form.city, form.country);
      setShowCityList(false);
      setShowCountryList(false);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, city: value }));
    setErrorMsg(null);

    if (value.length >= 2) {
      fetchcityList(value);
      setShowCityList(true);
    } else {
      setCityList([]);
      setShowCityList(false);
    }
  };

  const handleSelectCity = (suggestion) => {
    setForm({
      city: suggestion.city,
      country: suggestion.country,
    });
    setShowCityList(false);
    setShowCountryList(false);
    fetchWeather(suggestion.city, suggestion.country);
  };

  const handleInputFocus = (type) => {
    if (type === "city" && cityList.length > 0) {
      setShowCityList(true);
    } else if (type === "country" && filteredCountries.length > 0) {
      setShowCountryList(true);
    }
  };

  const handleInputBlur = (type) => {
    if (type === "city") {
      setTimeout(() => setShowCityList(false), 200);
    } else {
      setTimeout(() => setShowCountryList(false), 200);
    }
  };

  const handleCountryChange = (country) => {
    setForm((prev) => ({
      ...prev,
      country: country,
    }));

    const query = country.toLowerCase();
    setFilteredCountries(
      countryList.filter((c) => c.name.toLowerCase().includes(query))
    );
  };

  const selectCountry = (country) => {
    console.log("Selected country:", country);
    setForm((prev) => ({
      ...prev,
      country: country.name,
    }));
    setFilteredCountries([]);
  };

  const clearForm = () => {
    setForm({ city: "", country: "" });
    setWeatherData(null);
    setErrorMsg(null);
    setCityList([]);
    setShowCityList(false);
    setCountryList(false);
  };

  const handleHistoryClick = (item) => {
    setForm({ city: item.city, country: item.country });
    fetchWeather(item.city, item.country);
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get.country.all();
        const countries = res.data.map((item) => ({
          name: item.name.common,
          code: item.cca2,
        }));
        setCountryList(countries);
        setFilteredCountries(countries);
      } catch (err) {
        console.error("Error loading countries", err);
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 dark:text-white transition-all duration-300">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="flex flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl xl:text-3xl sm:text-4xl font-bold text-blue-600">
              Today's Weather
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="cursor-pointer px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm mt-auto rounded-full font-medium bg-gray-800 text-white hover:bg-gray-700 dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-400"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        <main className="rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 bg-white/80 border border-white/20 dark:bg-gray-800/80 dark:border-gray-700">
          {/* todo: improve weather card */}
          {weatherData && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 dark:from-blue-600/20 dark:to-purple-600/20 dark:border-blue-500/30">
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                    {weatherData.name}
                    {weatherData.sys?.country && (
                      <span className="block xs:inline text-base sm:text-lg font-normal mt-1 xs:mt-0 xs:ml-2 text-gray-600 dark:text-gray-300">
                        {countryList.find(
                          (c) => c.code === weatherData.sys.country
                        )?.name || weatherData.sys.country}
                      </span>
                    )}
                  </h2>
                  {weatherData.weather?.[0]?.main && (
                    <p className="text-base sm:text-lg capitalize text-gray-600 dark:text-gray-300 mt-1">
                      {weatherData.weather?.[0]?.main}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 dark:bg-gray-700/50">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {Math.round(weatherData.main?.temp || 0)}°C
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {Math.round(((weatherData.main?.temp || 0) * 9) / 5 + 32)}
                      °F
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 dark:bg-gray-700/50">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                      {weatherData.main?.humidity || 0}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Humidity
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 dark:bg-gray-700/50">
                    <div className="text-sm sm:text-lg font-semibold text-green-600 leading-tight">
                      {formatDateTime(new Date())}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Last Updated
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* form */}
          <div className="space-y-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <AppInput
                  type="text"
                  value={form.city}
                  onChange={handleCityChange}
                  onFocus={() => handleInputFocus("city")}
                  onBlur={() => handleInputBlur("city")}
                  placeholder="City"
                />
                {showCityList && cityList.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 rounded-xl shadow-lg bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:rounded-xl">
                    {cityList.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectCity(suggestion)}
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

              <div className="relative lg:w-1/3">
                <AppInput
                  type="text"
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  onFocus={() => handleInputFocus("country")}
                  onBlur={() => handleInputBlur("country")}
                  placeholder="Country"
                />
                {showCountryList &&
                  form.country &&
                  filteredCountries.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 max-h-80 overflow-auto rounded-xl shadow-lg bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:rounded-xl">
                      {filteredCountries.map((c, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            selectCountry(c);
                          }}
                          className="cursor-pointer w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white hover:rounded-xl"
                        >
                          <span className="font-medium">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-row gap-3">
              <AppButton
                type="submit"
                disabled={loading || !form.city.trim()}
                onClick={handleSubmit}
                label={"Search"}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                )}
              </AppButton>
              <AppButton
                type="button"
                onClick={clearForm}
                label={"Clear"}
                className="bg-gray-500 hover:bg-gray-600"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm sm:text-base">
              <span>Error: {errorMsg}</span>
            </div>
          )}

          {/* history */}
          <section>
            <div className="flex xs:flex-row justify-between items-start xs:items-center mb-3 sm:mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-bold">Recent Searches</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="cursor-pointer text-red-500 hover:text-red-400 font-medium text-xs sm:text-base shrink-0 ml-auto my-auto"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm sm:text-base">No recent searches</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-56 sm:max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                  >
                    <button
                      onClick={() => handleHistoryClick(item)}
                      className="flex flex-1 text-left min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium hover:text-blue-600 truncate text-sm sm:text-base">
                          {item.city}, {item.country}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {item.dateTime}, {item.weather}
                        </div>
                      </div>
                    </button>
                    <AppButton
                      type="button"
                      textBtn={true}
                      onClick={() => handleHistoryClick(item)}
                      label={"Search"}
                      className="[&>p]:text-blue-500 [&>p]:hover:text-blue-400 hover:bg-blue-500/10"
                    />
                    <AppButton
                      type="button"
                      textBtn={true}
                      onClick={() => deleteHistoryItem(item.id)}
                      label={"Delete"}
                      className="[&>p]:text-red-500 [&>p]:hover:text-red-400 hover:bg-red-500/10"
                    />
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
