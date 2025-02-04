document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const favoritesIcon = document.getElementById('favorites-icon');
  const favoritesPopup = document.getElementById('favorites-popup');
  const closePopupButton = document.getElementById('close-popup');
  const settingsIcon = document.getElementById('settings-icon');
  const settingsPopup = document.getElementById('settings-popup');
  const closeSettingsPopupButton = document.getElementById('close-settings-popup');
  const toggleUnitButton = document.getElementById('toggle-unit');
  const locationButton = document.getElementById('location-button');

  let isCelsius = false;

  // Fetch weather data for Philadelphia on startup
  fetchWeatherData('Philadelphia');

  searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          console.log('Enter key pressed');
          const query = searchInput.value;
          console.log('Query:', query);
          fetchWeatherData(query);
      }
  });

  favoritesIcon.addEventListener('click', () => {
      favoritesPopup.classList.remove('hidden');
  });

  closePopupButton.addEventListener('click', () => {
      favoritesPopup.classList.add('hidden');
  });

  settingsIcon.addEventListener('click', () => {
      settingsPopup.classList.remove('hidden');
  });

  closeSettingsPopupButton.addEventListener('click', () => {
      settingsPopup.classList.add('hidden');
  });

  toggleUnitButton.addEventListener('click', () => {
      isCelsius = !isCelsius;
      toggleUnitButton.textContent = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
      const query = searchInput.value;
      if (query) {
          fetchWeatherData(query);
      }
  });

  locationButton.addEventListener('click', () => {
      locationButton.classList.add('button-pressed');
      searchInput.value = '';
      fetchWeatherData('Philadelphia');
      setTimeout(() => {
          locationButton.classList.remove('button-pressed');
      }, 200);
  });

  function fetchWeatherData(query) {
      const apiKey = '112945193a161e00b334b0404055b6e0'; 
      const units = isCelsius ? 'metric' : 'imperial';
      const geoapi = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

      fetch(geoapi)
          .then(response => response.json())
          .then(data => {
              console.log('Geolocation data:', data);
              if (data.length > 0) {
                  const { lat, lon } = data[0];
                  fetchCurrentWeather(lat, lon, units);
                  fetchWeatherForecast(lat, lon, units);
              } else {
                  console.error('No geolocation data found for the query.');
              }
          })
          .catch(error => {
              console.error('Error fetching geolocation data:', error);
          });
  }

  function fetchCurrentWeather(latitude, longitude, units) {
      console.log('Fetching current weather data by coordinates:', latitude, longitude, units);
      const apiKey = '112945193a161e00b334b0404055b6e0';
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`;

      fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
              console.log('Current weather data:', data);
              updateCurrentWeather(data);
          })
          .catch(error => {
              console.error('Error fetching current weather data:', error);
          });
  }

  function fetchWeatherForecast(latitude, longitude, units) {
      console.log('Fetching weather forecast data by coordinates:', latitude, longitude, units);
      const apiKey = '112945193a161e00b334b0404055b6e0';
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`;

      fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
              console.log('Weather forecast data:', data);
              updateWeatherForecast(data);
          })
          .catch(error => {
              console.error('Error fetching weather forecast data:', error);
          });
  }

  function updateCurrentWeather(data) {
      const tempElement = document.querySelector('.temp');
      const feelsLikeElement = document.querySelector('.feels-like');
      const sunLogoElement = document.getElementById('sun-logo');
      const unitSymbol = isCelsius ? 'C' : 'F';

      tempElement.textContent = `${Math.round(data.main.temp)}°`;
      feelsLikeElement.textContent = `Feels like`;

      const weatherCondition = data.weather[0].main.toLowerCase();
      if (weatherCondition.includes('cloud')) {
          sunLogoElement.src = '/assets/cloud.png';
      } else if (weatherCondition.includes('rain')) {
          sunLogoElement.src = '/assets/rain.png';
      } else {
          sunLogoElement.src = '/assets/sun-icon-clipart-xl.png';
      }

      // Update sun/moon position based on local time of the location
      const timezoneOffset = data.timezone; // Timezone offset in seconds
      const localTime = new Date((data.dt + timezoneOffset) * 1000);
      const hours = localTime.getUTCHours();
      const isDayTime = hours >= 6 && hours < 18;

      if (isDayTime) {
          console.log('Hours:', hours);
          const percentageOfDay = (hours - 6) / 16;
          console.log('Percentage of day:', percentageOfDay);
          let leftPosition = 100 - percentageOfDay * 80;
          console.log('Left position:', leftPosition);
          leftPosition = Math.max(40, leftPosition);
          leftPosition = Math.min(58, leftPosition);
          sunLogoElement.style.left = `${leftPosition}%`;
          sunLogoElement.style.top = '10%';
          document.body.classList.add('daytime');
          document.body.classList.remove('nighttime');
      } else {
          sunLogoElement.src = '/assets/white_moon.png';
          const percentageOfDay = (hours % 12) / 12;
          console.log('Percentage of day:', percentageOfDay);
          let leftPosition = 100 - percentageOfDay * 80;
          console.log('Left position:', leftPosition);
          leftPosition = Math.max(40, leftPosition);
          leftPosition = Math.min(58, leftPosition);
          sunLogoElement.style.left = `${leftPosition}%`;
          sunLogoElement.style.top = '10%';
          document.body.classList.add('daytime');
          document.body.classList.remove('nighttime');
          sunLogoElement.style.top = '10%';
          document.body.classList.add('nighttime');
          document.body.classList.remove('daytime');
      }
  }

  function updateWeatherForecast(data) {
      const hourlyForecastElement = document.getElementById('hourly-forecast');
      const precipitationElement = document.querySelector('.precipitation span');
      const precipitationTextElement = document.querySelector('.precipitation div');
      const windElement = document.querySelector('.wind-info p');
      const gustElement = document.querySelector('.wind-info .gusts');
      const windCompassElement = document.getElementById('wind-compass');
      const windDirectionElement = document.getElementById('wind-direction');
      const unitSymbol = isCelsius ? 'C' : 'F';

      // Populate hourly forecast
      hourlyForecastElement.innerHTML = ''; // Clear previous forecast
      data.list.slice(0, 12).forEach(hourData => {
          const hourElement = document.createElement('div');
          hourElement.className = 'hour';

          const timezoneOffset = data.city.timezone; // Timezone offset in seconds
          const hourTime = new Date((hourData.dt + timezoneOffset) * 1000);
          const hour = hourTime.getUTCHours();
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hourFormatted = hour % 12 || 12;

          hourElement.innerHTML = `
              <div>${hourFormatted} ${ampm}</div>
              <div class="hourly-temp">${Math.round(hourData.main.temp)}°${unitSymbol}</div>
              <div>
                  <img src="/assets/${hourData.weather[0].main.toLowerCase().includes('cloud') ? 'cloud' : hourData.weather[0].main.toLowerCase().includes('rain') ? 'rain' : 'sun-icon-clipart-xl'}.png" alt="weather icon" class="icon">
              </div>
          `;
          hourlyForecastElement.appendChild(hourElement);
      });

      // Update precipitation and wind information
      const precipitation = data.list[0].pop * 100; // Probability of precipitation
      const windSpeed = Math.round(data.list[0].wind.speed); // Wind speed
      const windGust = Math.round(data.list[0].wind.gust); // Wind gust
      const windDirection = data.list[0].wind.deg; // Wind direction in degrees

      precipitationElement.textContent = `${precipitation}%`;
      windElement.textContent = `${windSpeed} mph`;
      gustElement.textContent = `${windGust} mph`;

      // Rotate the compass based on wind direction
      windCompassElement.style.transform = `rotate(${windDirection}deg)`;

      // Update wind direction text
      windDirectionElement.textContent = getWindDirectionText(windDirection);

      // Check for next rain event
      let nextRain = null;
      for (let i = 0; i < data.list.length; i++) {
          if (data.list[i].pop > 0) {
              nextRain = data.list[i];
              break;
          }
      }

      if (nextRain) {
          const nextRainTime = new Date((nextRain.dt + data.city.timezone) * 1000);
          const nextRainHours = nextRainTime.getUTCHours();
          const nextRainAmpm = nextRainHours >= 12 ? 'PM' : 'AM';
          const nextRainFormatted = nextRainHours % 12 || 12;
          precipitationTextElement.textContent = `Next rain at ${nextRainFormatted} ${nextRainAmpm}`;
      } else {
          precipitationTextElement.textContent = 'All Clear!';
      }
  }

  function getWindDirectionText(degree) {
      if (degree > 337.5 || degree <= 22.5) return 'N';
      if (degree > 22.5 && degree <= 67.5) return 'NE';
      if (degree > 67.5 && degree <= 112.5) return 'E';
      if (degree > 112.5 && degree <= 157.5) return 'SE';
      if (degree > 157.5 && degree <= 202.5) return 'S';
      if (degree > 202.5 && degree <= 247.5) return 'SW';
      if (degree > 247.5 && degree <= 292.5) return 'W';
      if (degree > 292.5 && degree <= 337.5) return 'NW';
  }
});