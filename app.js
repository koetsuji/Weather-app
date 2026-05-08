const API_KEY = "ca98b0ba703a0a3d2ed3a9aba0840545";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const suggestionsBox = document.getElementById("suggestions");

const temperatureEl = document.getElementById("temperature");
const conditionEl = document.getElementById("weather-condition");
const cityNameEl = document.getElementById("city-name");
const dateEl = document.getElementById("date");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const feelsLikeEl = document.getElementById("feels-like");

let selectedCity = null;
let debounceTimer = null;

function formatDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

async function getCitySuggestions(query) {
    if (query.length < 2) {
        suggestionsBox.style.display = "none";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

    const response = await fetch(url);
    const cities = await response.json();

    suggestionsBox.innerHTML = "";

    cities.forEach(city => {
        const item = document.createElement("div");
        item.classList.add("suggestion-item");

        item.textContent = `${city.name}, ${city.country}`;

        item.addEventListener("click", () => {
            selectedCity = city;
            searchInput.value = `${city.name}, ${city.country}`;
            suggestionsBox.style.display = "none";
            getWeather(city.lat, city.lon, city.name, city.country);
        });

        suggestionsBox.appendChild(item);
    });

    suggestionsBox.style.display = cities.length ? "block" : "none";
}

async function getWeather(lat, lon, cityName, country) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    temperatureEl.textContent = `${Math.round(data.main.temp)}°`;
    conditionEl.textContent = data.weather[0].description;
    cityNameEl.textContent = `${cityName}, ${country}`;
    dateEl.textContent = formatDate();
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
}

searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        getCitySuggestions(searchInput.value.trim());
    }, 300);
});

searchBtn.addEventListener("click", () => {
    if (selectedCity) {
        getWeather(
            selectedCity.lat,
            selectedCity.lon,
            selectedCity.name,
            selectedCity.country
        );
    }
});