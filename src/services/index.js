import axios from "axios";

const weatherService = axios.create({
  baseURL: "https://api.openweathermap.org/",
  headers: { "Content-Type": "application/json" },
});

const countryService = axios.create({
  baseURL: "https://restcountries.com/v3.1/",
  headers: { "Content-Type": "application/json" },
});

// OR export as a grouped object
const services = {
  weather: weatherService,
  country: countryService,
};

export default services;
