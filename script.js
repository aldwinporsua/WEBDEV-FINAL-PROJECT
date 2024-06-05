const apiKey = '3b559440aabdcd7940158c542095da17';
const unsplashAccessKey = 'WiqCppo_ZOPrxoDNHk5Th8j1HfcV9NENIbOLeg6mOLw';
const cities = ['Manila', 'Legazpi', 'Naga', 'Quezon City', 'Cebu City', 'Davao City', 'Zamboanga City', 'Taguig', 'Pasig', 'Antipolo', 'Cagayan de Oro', 'Parañaque'];

const getRandomCities = () => {
    const shuffled = cities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}; 

const getWeatherForCity = (city, cardIdPrefix) => {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            const temperature = Math.round(data.main.temp); 
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            document.getElementById(`${cardIdPrefix}-name`).innerText = data.name;
            document.getElementById(`${cardIdPrefix}-temp`).innerText = `${temperature}°C`;
            document.getElementById(`${cardIdPrefix}-icon`).src = iconUrl;
            document.getElementById(`${cardIdPrefix}-icon`).alt = data.weather[0].description;
        })
        .catch(error => {
            console.error(`Error fetching weather data for ${city}:`, error);
        });
};

const updateWeatherCards = () => {
    const randomCities = getRandomCities();
    getWeatherForCity(randomCities[0], 'city1');
    getWeatherForCity(randomCities[1], 'city2');
    getWeatherForCity(randomCities[2], 'city3');
};

setInterval(updateWeatherCards, 5000);
updateWeatherCards();

const getWeather = () => {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            getBackgroundImage(data.weather[0].description);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching forecast data');
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
};

const displayWeather = data => {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp); 
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `
            <p>${temperature}°C</p>
        `;

        const weatherHtml = `
            <p>${cityName}</p>
            <p>${description}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.style.display = 'block';
    }
};

const displayHourlyForecast = list => {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const forecast = list[i];
        const temp = Math.round(forecast.main.temp); 
        const time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const iconCode = forecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';

        hourlyItem.innerHTML = `
            <p>${time}</p>
            <img src="${iconUrl}" alt="${forecast.weather[0].description}">
            <p>${temp}°C</p>
        `;

        hourlyForecastDiv.appendChild(hourlyItem);
    }
};

const getBackgroundImage = (description) => {
    const url = `https://api.unsplash.com/photos/random?query=${description}&client_id=${unsplashAccessKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.urls && data.urls.regular) {
                document.body.style.backgroundImage = `url(${data.urls.regular})`;
            }
        })
        .catch(error => {
            console.error('Error fetching background image:', error);
        });
};

const resetWeather = () => {
    document.getElementById('city').value = '';
    document.getElementById('temp-div').innerHTML = '';
    document.getElementById('weather-info').innerHTML = '';
    document.getElementById('weather-icon').style.display = 'none';
    document.getElementById('hourly-forecast').innerHTML = '';
};

const getWeatherForCurrentLocation = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            fetch(currentWeatherUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch weather data for current location');
                    }
                    return response.json();
                })
                .then(data => {
                    displayWeather(data);
                    getBackgroundImage(data.weather[0].description);
                })
                .catch(error => {
                    console.error('Error fetching current weather data for current location:', error);
                    alert('Error fetching current weather data for current location. Please try again.');
                });

            fetch(forecastUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch forecast data for current location');
                    }
                    return response.json();
                })
                .then(data => {
                    displayHourlyForecast(data.list);
                })
                .catch(error => {
                    console.error('Error fetching hourly forecast data for current location:', error);
                    alert('Error fetching hourly forecast data for current location. Please try again.');
                });
        }, error => {
            console.error('Error getting current location:', error);
            alert('Error getting current location. Please make sure location services are enabled.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
};

