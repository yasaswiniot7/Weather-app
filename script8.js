let valueSearch = document.getElementById('valueSearch');
let city = document.getElementById('city');
let temperature = document.getElementById('temperature');
let description = document.querySelector('.description');
let clouds = document.getElementById('clouds');
let humidity = document.getElementById('humidity');
let pressure = document.getElementById('pressure');
let windSpeed = document.getElementById('windSpeed');
let visibility = document.getElementById('visibility');
let form = document.querySelector('form');
let main = document.querySelector('main');
let hourlyReport = document.getElementById('hourlyReport');
let weeklyReport = document.getElementById('weeklyReport');
let nextSlide = document.getElementById('nextSlide');
let prevSlide = document.getElementById('prevSlide');
let slide1 = document.getElementById('slide1');
let slide2 = document.getElementById('slide2');
let dateTime = document.getElementById('dateTime');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (valueSearch.value.trim() !== '') {
        searchWeather();
    }
});

nextSlide.addEventListener('click', () => {
    slide1.classList.add('hidden');
    slide2.classList.remove('hidden');
});

prevSlide.addEventListener('click', () => {
    slide2.classList.add('hidden');
    slide1.classList.remove('hidden');
});

let apiKey = '7b15a1afbffcc87c6a68b44b1333173b'; // Replace with your actual OpenWeatherMap API key
let url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + apiKey;
let forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + apiKey;

const searchWeather = () => {
    fetch(url + '&q=' + encodeURIComponent(valueSearch.value))
        .then(response => response.json())
        .then(data => {
            console.log("API Data:", data);
            if (data.cod == 200) {
                // Update city name
                city.querySelector('figcaption').innerText = data.name;

                // Get country code from API response
                let countryCode = data.sys.country.toLowerCase(); // Convert to lowercase
                console.log("Country Code:", countryCode);

                // Update flag image source using Flagpedia
                city.querySelector('img').src = 'https://flagcdn.com/64x48/' + countryCode + '.png';
                city.querySelector('img').alt = data.sys.country + ' Flag';

                // Update temperature and weather icon
                temperature.querySelector('img').src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
                temperature.querySelector('figcaption span').innerText = Math.round(data.main.temp);

                // Update weather description
                description.innerText = data.weather[0].description;

                // Update clouds, humidity, pressure, wind speed, and visibility
                clouds.innerText = data.clouds.all;
                humidity.innerText = data.main.humidity;
                pressure.innerText = data.main.pressure;
                windSpeed.innerText = data.wind.speed;
                visibility.innerText = data.visibility / 1000;

                // Fetch hourly and weekly forecast
                fetch(forecastUrl + '&q=' + encodeURIComponent(valueSearch.value))
                    .then(response => response.json())
                    .then(forecastData => {
                        console.log("Forecast Data:", forecastData);
                        updateHourlyReport(forecastData);
                        updateWeeklyReport(forecastData);
                    });

                // Update date and time based on timezone
                updateDateTime(data.timezone);

            } else {
                console.error("Error fetching data:", data.message);
                main.classList.add('error');
                setTimeout(() => {
                    main.classList.remove('error');
                }, 1000);
                description.innerText = 'City not found. Please try again.';
            }
            valueSearch.value = '';
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            main.classList.add('error');
            setTimeout(() => {
                main.classList.remove('error');
            }, 1000);
            description.innerText = 'An error occurred. Please try again later.';
        });
};

const updateHourlyReport = (data) => {
    hourlyReport.innerHTML = '<h2>Hourly Report</h2>';
    let hourlyData = data.list.slice(0, 8);
    hourlyData.sort((a, b) => new Date(a.dt_txt) - new Date(b.dt_txt));
    hourlyData.forEach(hourData => {
        let hourElement = document.createElement('div');
        hourElement.classList.add('hour');
        hourElement.innerHTML = `
            <p>${new Date(hourData.dt_txt).getHours()}:00</p>
            <img src="https://openweathermap.org/img/wn/${hourData.weather[0].icon}.png" alt="Weather Icon">
            <p>${Math.round(hourData.main.temp)}°C</p>
        `;
        hourlyReport.appendChild(hourElement);
    });
};

const updateWeeklyReport = (data) => {
    weeklyReport.innerHTML = '<h2>Weekly Report</h2>';
    let dailyData = [];
    for (let i = 0; i < data.list.length; i += 8) {
        dailyData.push(data.list[i]);
    }
    dailyData.sort((a, b) => new Date(a.dt_txt) - new Date(b.dt_txt));
    dailyData.forEach(dayData => {
        let dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerHTML = `
            <p>${new Date(dayData.dt_txt).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="Weather Icon">
            <p>${Math.round(dayData.main.temp)}°C</p>
        `;
        weeklyReport.appendChild(dayElement);
    });
};

// Update date and time based on timezone
const updateDateTime = (timezone) => {
    let now = new Date();
    let utcOffset = now.getTimezoneOffset() * 60000; // Convert local timezone offset to milliseconds
    let localTime = new Date(now.getTime() + utcOffset + (timezone * 1000)); // Adjust local time by timezone offset
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    dateTime.innerText = localTime.toLocaleDateString('en-US', options);
};

// Initialize the app with a default city
const initApp = () => {
    valueSearch.value = 'New York';
    searchWeather();
};
initApp();

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 150);
});

const handleResize = () => {
    // Add any dynamic layout adjustments here if needed
    console.log("Window resized. Current dimensions:", window.innerWidth, window.innerHeight);
};
