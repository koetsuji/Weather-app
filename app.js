const apiKey = 'ca98b0ba703a0a3d2ed3a9aba0840545';
const mapApiKey = 'AIzaSyCICbCwaiYz2QRS97gS9fV1AJGSk4fV0_o';
const mapContainer = document.getElementById('map');

// Function to add weather icon
function addWeatherIcon(iconId, elementId) {
  const iconElement = document.createElement('span');
  iconElement.classList.add('weather-icon');
  iconElement.classList.add('animate__animated', 'animate__fadeIn', 'animate__slow');
  iconElement.innerHTML = `<i class="wi wi-owm-${iconId}"></i>`;
  document.getElementById(elementId).appendChild(iconElement);
}

// Initialize map
function initMap(latitude, longitude) {
    console.log('initMap() called');
    console.log('latitude:', latitude);
    console.log('longitude:', longitude);
  
    const mapElement = document.getElementById('map');
    const mapOptions = {
      center: { lat: latitude, lng: longitude },
      zoom: 12,
    };
    const map = new google.maps.Map(mapElement, mapOptions);
    const marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
    });
  }

// Get location from IP address
fetch(`https://ipinfo.io/json?token=b259edd71368c0`)
  .then(response => response.json())
  .then(({ city, country, loc }) => {
    // Set current city name
    document.getElementById('current-city').textContent = `${city}, ${country}`;

    // Get current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`)
      .then(response => response.json())
      .then(({ cod, main, weather }) => {
        if (cod === '404') {
          throw new Error('City not found');
        }
        document.getElementById('current-temperature').textContent = main.temp;
        document.getElementById('current-humidity').textContent = main.humidity;
        document.getElementById('current-description').textContent = weather[0].description;
        addWeatherIcon(weather[0].id, 'current-city');
      })
      .catch(error => {
        console.error('Error fetching current weather:', error);
      });

    // Initialize Google Maps with current location
    const [latitude, longitude] = loc.split(',');
    initMap(latitude, longitude);
  })
  .catch(error => {
    console.error('Error fetching location:', error);
  });

// Get city list for search bar
fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json')
  .then(response => response.json())
  .then(cityList => {
    const datalist = document.getElementById('cities');
    cityList.forEach(({ name }) => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Unable to retrieve city list:', error);
  });

// Handle form submission
const form = document.querySelector('form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const location = document.getElementById('location').value;

 // Get weather for location
 fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`)
 .then(response => response.json())
 .then(({ cod, main, weather }) => {
   if (cod === '404') {
     throw new Error('City not found');
   }
   document.getElementById('city').textContent = location;
   document.getElementById('temperature').textContent = main.temp;
   document.getElementById('humidity').textContent = main.humidity;
   document.getElementById('description').textContent = weather[0].description;
   addWeatherIcon(weather[0].id, 'city');
 })
 .catch(error => {
   console.error('Error fetching weather data:', error);
 });
});