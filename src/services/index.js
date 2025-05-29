import axios from "axios";

const services = axios.create({
	baseURL: "https://api.openweathermap.org/",
	headers: { "Content-Type": "application/json" },
});

export default services;
