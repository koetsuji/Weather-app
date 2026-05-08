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
const weatherIcon = document.getElementById("weather-icon");
const weatherCard = document.querySelector(".weather-card");
const statusMessage = document.getElementById("status-message");

let selectedCity = null;
let currentSuggestions = [];
let debounceTimer = null;

function formatDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

function formatCityLabel(city) {
    const state = city.state ? `, ${city.state}` : "";
    return `${city.name}${state}, ${city.country}`;
}

function getWeatherIcon(condition) {
    condition = condition.toLowerCase();

    if (condition.includes("cloud")) {
        return `
            <svg viewBox="0 0 64 64" fill="none">
                <path d="M22 46h25a11 11 0 0 0 0-22 16 16 0 0 0-31-4A13 13 0 0 0 22 46z" fill="white" opacity="0.9"/>
            </svg>
        `;
    }

    if (condition.includes("rain")) {
        return `
            <svg viewBox="0 0 64 64" fill="none">
                <path d="M22 38h25a10 10 0 0 0 0-20 15 15 0 0 0-29-3A12 12 0 0 0 22 38z" fill="white" opacity="0.9"/>
                <path d="M24 46l-3 7M34 46l-3 7M44 46l-3 7" stroke="#8ab4ff" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `;
    }

    if (condition.includes("snow")) {
        return `
            <svg viewBox="0 0 64 64" fill="none">
                <path d="M22 38h25a10 10 0 0 0 0-20 15 15 0 0 0-29-3A12 12 0 0 0 22 38z" fill="white" opacity="0.9"/>
                <circle cx="24" cy="50" r="2" fill="#dff6ff"/>
                <circle cx="34" cy="54" r="2" fill="#dff6ff"/>
                <circle cx="44" cy="50" r="2" fill="#dff6ff"/>
            </svg>
        `;
    }

    if (condition.includes("storm") || condition.includes("thunder")) {
        return `
            <svg viewBox="0 0 64 64" fill="none">
                <path d="M22 38h25a10 10 0 0 0 0-20 15 15 0 0 0-29-3A12 12 0 0 0 22 38z" fill="white" opacity="0.88"/>
                <path d="M34 41l-6 10h7l-4 9 12-14h-7l5-5h-7z" fill="#ffd43b"/>
            </svg>
        `;
    }

    return `
        <svg viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="13" fill="white"/>
            <path d="M32 8v8M32 48v8M56 32h-8M16 32H8M49 15l-6 6M21 43l-6 6M49 49l-6-6M21 21l-6-6" stroke="white" stroke-width="5" stroke-linecap="round"/>
        </svg>
    `;
}

function updateWeatherBackground(condition) {
    condition = condition.toLowerCase();

    document.body.classList.remove(
        "weather-clear",
        "weather-clouds",
        "weather-rain",
        "weather-snow",
        "weather-storm"
    );

    if (condition.includes("clear")) {
        document.body.classList.add("weather-clear");
    } else if (condition.includes("cloud")) {
        document.body.classList.add("weather-clouds");
    } else if (condition.includes("rain")) {
        document.body.classList.add("weather-rain");
    } else if (condition.includes("snow")) {
        document.body.classList.add("weather-snow");
    } else if (condition.includes("storm") || condition.includes("thunder")) {
        document.body.classList.add("weather-storm");
    }
}

function setLoading(isLoading) {
    weatherCard.classList.toggle("loading", isLoading);
    searchBtn.classList.toggle("loading", isLoading);
    searchBtn.textContent = isLoading ? "Loading" : "Search";
}

async function getCitySuggestions(query) {
    if (query.length < 2) {
        currentSuggestions = [];
        suggestionsBox.style.display = "none";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

    try {
        const response = await fetch(url);
        const cities = await response.json();

        currentSuggestions = cities;
        suggestionsBox.innerHTML = "";

        cities.forEach(city => {
            const item = document.createElement("div");
            item.classList.add("suggestion-item");
            item.textContent = formatCityLabel(city);

            item.addEventListener("click", () => {
                selectedCity = city;
                searchInput.value = formatCityLabel(city);
                suggestionsBox.style.display = "none";
                getWeather(city.lat, city.lon, city.name, city.country);
            });

            suggestionsBox.appendChild(item);
        });

        suggestionsBox.style.display = cities.length ? "block" : "none";

    } catch (error) {
        console.error("City suggestion error:", error);
        currentSuggestions = [];
        suggestionsBox.style.display = "none";
    }
}

async function getWeather(lat, lon, cityName, country) {
    setLoading(true);

    statusMessage.textContent = "Couldn’t load weather. Try another city.";
    statusMessage.textContent = "Location access unavailable. Search a city manually.";

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();
        const condition = data.weather[0].description;

        temperatureEl.textContent = `${Math.round(data.main.temp)}°`;
        conditionEl.textContent = condition;
        updateWeatherBackground(condition);
        weatherIcon.innerHTML = getWeatherIcon(condition);

        cityNameEl.textContent = `${cityName}, ${country}`;
        dateEl.textContent = formatDate();
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;

    } catch (error) {
        console.error("Weather fetch error:", error);
        conditionEl.textContent = "Unable to load weather";
    } finally {
        setLoading(false);
    }
}

function searchSelectedOrFirstCity() {
    if (selectedCity) {
        getWeather(
            selectedCity.lat,
            selectedCity.lon,
            selectedCity.name,
            selectedCity.country
        );

        suggestionsBox.style.display = "none";
        return;
    }

    if (currentSuggestions.length > 0) {
        const firstCity = currentSuggestions[0];

        selectedCity = firstCity;
        searchInput.value = formatCityLabel(firstCity);
        suggestionsBox.style.display = "none";

        getWeather(
            firstCity.lat,
            firstCity.lon,
            firstCity.name,
            firstCity.country
        );
    }
}

searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    selectedCity = null;

    debounceTimer = setTimeout(() => {
        getCitySuggestions(searchInput.value.trim());
    }, 300);
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchSelectedOrFirstCity();
    }
});

searchBtn.addEventListener("click", () => {
    searchSelectedOrFirstCity();
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-container")) {
        suggestionsBox.style.display = "none";
    }
});

function loadUserWeather() {
    if (!navigator.geolocation) {
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const reverseUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

            try {
                const response = await fetch(reverseUrl);
                const locationData = await response.json();

                if (locationData.length > 0) {
                    const city = locationData[0];
                    getWeather(lat, lon, city.name, city.country);
                }
            } catch (error) {
                console.error("Geolocation error:", error);
            }
        },
        (error) => {
            console.warn("Location permission unavailable or denied:", error);
        }
    );
}

loadUserWeather();