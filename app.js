// Weather Interpretation Mapping (WMO Codes)
const weatherMapping = {
    0: { desc: 'ท้องฟ้าแจ่มใส', icon: 'sun', iconNight: 'moon' },
    1: { desc: 'ท้องฟ้าโปร่ง', icon: 'cloud-sun', iconNight: 'cloud-moon' },
    2: { desc: 'มีเมฆบางส่วน', icon: 'cloud-sun', iconNight: 'cloud-moon' },
    3: { desc: 'มีเมฆครึ้ม', icon: 'cloud', iconNight: 'cloud' },
    45: { desc: 'หมอกหนา', icon: 'cloud-fog', iconNight: 'cloud-fog' },
    48: { desc: 'หมอกหนามีเกล็ดน้ำค้างแข็ง', icon: 'cloud-fog', iconNight: 'cloud-fog' },
    51: { desc: 'ฝนตกปรอยๆ เบาบาง', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle' },
    53: { desc: 'ฝนตกปรอยๆ ปานกลาง', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle' },
    55: { desc: 'ฝนตกปรอยๆ หนาแน่น', icon: 'cloud-drizzle', iconNight: 'cloud-drizzle' },
    56: { desc: 'ฝนตกปรอยๆ แบบเยือกแข็ง เบาบาง', icon: 'snowflake', iconNight: 'snowflake' },
    57: { desc: 'ฝนตกปรอยๆ แบบเยือกแข็ง หนาแน่น', icon: 'snowflake', iconNight: 'snowflake' },
    61: { desc: 'ฝนตกเล็กน้อย', icon: 'cloud-rain', iconNight: 'cloud-rain' },
    63: { desc: 'ฝนตกปานกลาง', icon: 'cloud-rain', iconNight: 'cloud-rain' },
    65: { desc: 'ฝนตกหนัก', icon: 'cloud-rain', iconNight: 'cloud-rain' },
    66: { desc: 'ฝนตกแบบเยือกแข็ง เบาบาง', icon: 'snowflake', iconNight: 'snowflake' },
    67: { desc: 'ฝนตกแบบเยือกแข็ง หนัก', icon: 'snowflake', iconNight: 'snowflake' },
    71: { desc: 'หิมะตกเล็กน้อย', icon: 'snowflake', iconNight: 'snowflake' },
    73: { desc: 'หิมะตกปานกลาง', icon: 'snowflake', iconNight: 'snowflake' },
    75: { desc: 'หิมะตกหนัก', icon: 'snowflake', iconNight: 'snowflake' },
    77: { desc: 'ลูกเห็บหิมะ', icon: 'snowflake', iconNight: 'snowflake' },
    80: { desc: 'ฝนซู่ เล็กน้อย', icon: 'cloud-rain', iconNight: 'cloud-rain' },
    81: { desc: 'ฝนซู่ ปานกลาง', icon: 'cloud-rain', iconNight: 'cloud-rain' },
    82: { desc: 'ฝนซู่ หนักรุนแรง', icon: 'cloud-rain', iconNight: 'cloud-rain' },
    85: { desc: 'หิมะซู่ เล็กน้อย', icon: 'snowflake', iconNight: 'snowflake' },
    86: { desc: 'หิมะซู่ หนัก', icon: 'snowflake', iconNight: 'snowflake' },
    95: { desc: 'พายุฝนฟ้าคะนอง', icon: 'cloud-lightning', iconNight: 'cloud-lightning' },
    96: { desc: 'พายุฝนฟ้าคะนองพร้อมลูกเห็บตกเล็กน้อย', icon: 'cloud-lightning', iconNight: 'cloud-lightning' },
    99: { desc: 'พายุฝนฟ้าคะนองพร้อมลูกเห็บตกหนัก', icon: 'cloud-lightning', iconNight: 'cloud-lightning' }
};

// Global App State
let map = null;
let marker = null;
let currentChart = null;
let searchTimeout = null;

// DOM Elements
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions-box');
const geoBtn = document.getElementById('geo-btn');
const currentLoader = document.getElementById('current-loader');
const currentWeatherContent = document.getElementById('current-weather-content');
const locationNameEl = document.getElementById('location-name');
const currentDateEl = document.getElementById('current-date');
const mainTempEl = document.getElementById('main-temp');
const weatherIconMainEl = document.getElementById('weather-icon-main');
const weatherDescEl = document.getElementById('weather-desc');
const feelTempEl = document.getElementById('feel-temp');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const pressureEl = document.getElementById('pressure');
const weatherExtraEl = document.getElementById('weather-extra');
const sunriseTimeEl = document.getElementById('sunrise-time');
const sunsetTimeEl = document.getElementById('sunset-time');
const uvIndexEl = document.getElementById('uv-index');
const uvLevelEl = document.getElementById('uv-level');
const uvBarFillEl = document.getElementById('uv-bar-fill');
const hourlyForecastList = document.getElementById('hourly-forecast-list');
const dailyForecastListEl = document.getElementById('daily-forecast-list');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initGeolocation();
    setupEventListeners();
});

// Initialize Leaflet Map
function initMap() {
    // Default to Bangkok coordinate
    const defaultLat = 13.7563;
    const defaultLon = 100.5018;

    map = L.map('map', {
        zoomControl: true,
        attributionControl: false
    }).setView([defaultLat, defaultLon], 10);

    // Dark styled maps filter via CSS (handled in style.css)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    // Create drag-and-drop Marker
    marker = L.marker([defaultLat, defaultLon], {
        draggable: true
    }).addTo(map);

    // Map click event
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
    });

    // Marker drag end event
    marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        updateLocation(lat, lng);
    });
}

// Check Geolocation Access
function initGeolocation() {
    showLoader();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                updateLocation(lat, lon);
            },
            (error) => {
                console.warn('Geolocation blocked or error. Defaulting to Bangkok.', error);
                // Fallback to Bangkok
                updateLocation(13.7563, 100.5018, "กรุงเทพมหานคร, ประเทศไทย");
            }
        );
    } else {
        // Fallback to Bangkok
        updateLocation(13.7563, 100.5018, "กรุงเทพมหานคร, ประเทศไทย");
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search input typing with debounce
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.classList.add('hidden');
            return;
        }

        searchTimeout = setTimeout(() => {
            fetchSuggestions(query);
        }, 400);
    });

    // Geolocation button click
    geoBtn.addEventListener('click', () => {
        initGeolocation();
    });

    // Quick location buttons click
    document.querySelectorAll('.quick-loc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lat = parseFloat(e.target.dataset.lat);
            const lon = parseFloat(e.target.dataset.lon);
            const name = e.target.innerText;
            updateLocation(lat, lon, name);
        });
    });

    // Close suggestions box when click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.add('hidden');
        }
    });
}

// Fetch Search Suggestions from Nominatim
async function fetchSuggestions(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=th,en`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'th,en',
                'User-Agent': 'SkyFlowWeatherApp/1.0'
            }
        });
        const data = await response.json();
        renderSuggestions(data);
    } catch (err) {
        console.error('Error fetching suggestions:', err);
    }
}

// Render Autocomplete Suggestions List
function renderSuggestions(results) {
    suggestionsBox.innerHTML = '';
    
    if (results.length === 0) {
        suggestionsBox.classList.add('hidden');
        return;
    }

    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        // Build pretty address label
        const address = item.address;
        const city = address.city || address.town || address.village || address.state || '';
        const country = address.country || '';
        const nameStr = item.name ? item.name : '';
        const displayLabel = [nameStr, city, country].filter(v => v !== '').join(', ');
        
        div.innerText = displayLabel;
        div.addEventListener('click', () => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            updateLocation(lat, lon, displayLabel);
            suggestionsBox.classList.add('hidden');
            searchInput.value = displayLabel;
        });
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.remove('hidden');
}

// Core updater when coordinates change
async function updateLocation(lat, lon, name = null) {
    showLoader();
    
    // Smoothly pan map and place marker
    map.setView([lat, lon], 12);
    marker.setLatLng([lat, lon]);

    try {
        // 1. Fetch location name if not provided
        if (!name) {
            name = await reverseGeocode(lat, lon);
        }
        locationNameEl.innerText = name;

        // 2. Fetch Weather Data from Open-Meteo
        const weatherData = await fetchWeatherData(lat, lon);
        
        // 3. Update Current Weather
        renderCurrentWeather(weatherData);

        // 4. Update Hourly Scroll Carousel
        renderHourlyForecast(weatherData);

        // 5. Render/Update Chart.js Trends
        renderChart(weatherData);

        // 6. Update 7-Day Forecast Grid
        render7DayForecast(weatherData);

        // Refresh Lucide Icons to draw newly inserted icons
        lucide.createIcons();
    } catch (err) {
        console.error('Error updating location data:', err);
        locationNameEl.innerText = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    } finally {
        hideLoader();
    }
}

// Reverse Geocoding to get City/Country Name
async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1&accept-language=th,en`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'th,en',
                'User-Agent': 'SkyFlowWeatherApp/1.0'
            }
        });
        const data = await response.json();
        if (data && data.address) {
            const addr = data.address;
            const district = addr.suburb || addr.neighborhood || '';
            const city = addr.city || addr.town || addr.municipality || addr.county || addr.province || addr.state || '';
            const country = addr.country || '';
            
            const parts = [district, city, country].filter(x => x !== '');
            return parts.length > 0 ? parts.join(', ') : `พิกัด: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    } catch (err) {
        console.error('Reverse geocode failed:', err);
    }
    return `พิกัด: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// Fetch Weather from Open-Meteo
async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API request failed');
    return await response.json();
}

// Populate current weather interface
function renderCurrentWeather(data) {
    const cur = data.current;
    
    // Set formatted Date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = today.toLocaleDateString('th-TH', options);

    // Weather details
    mainTempEl.innerText = Math.round(cur.temperature_2m);
    feelTempEl.innerText = `${Math.round(cur.apparent_temperature)}°C`;
    humidityEl.innerText = `${cur.relative_humidity_2m}%`;
    windSpeedEl.innerText = `${Math.round(cur.wind_speed_10m)} กม./ชม.`;
    pressureEl.innerText = `${Math.round(cur.pressure_msl)} hPa`;

    // Map weather code
    const isDay = cur.is_day === 1;
    const weatherInfo = weatherMapping[cur.weather_code] || { desc: 'ไม่ทราบสภาพอากาศ', icon: 'cloud', iconNight: 'cloud' };
    const iconName = isDay ? weatherInfo.icon : weatherInfo.iconNight;
    
    weatherDescEl.innerText = weatherInfo.desc;
    weatherIconMainEl.innerHTML = `<i data-lucide="${iconName}"></i>`;

    // Sunrise, Sunset and UV
    if (data.daily && data.daily.sunrise && data.daily.sunset) {
        weatherExtraEl.classList.remove('hidden');
        
        // Formating ISO string sunrise
        const sunriseTime = new Date(data.daily.sunrise[0]).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        
        sunriseTimeEl.innerText = sunriseTime;
        sunsetTimeEl.innerText = sunsetTime;

        // UV Index
        const uv = data.daily.uv_index_max[0] || 0;
        uvIndexEl.innerText = uv.toFixed(1);
        
        let uvLevel = 'ต่ำ';
        let barFillWidth = Math.min((uv / 12) * 100, 100);
        
        if (uv >= 11) uvLevel = 'อันตรายจัด';
        else if (uv >= 8) uvLevel = 'สูงจัด';
        else if (uv >= 6) uvLevel = 'สูง';
        else if (uv >= 3) uvLevel = 'ปานกลาง';
        
        uvLevelEl.innerText = `(${uvLevel})`;
        uvBarFillEl.style.width = `${barFillWidth}%`;
    } else {
        weatherExtraEl.classList.add('hidden');
    }
}

// Populate hourly carousel
function renderHourlyForecast(data) {
    hourlyForecastList.innerHTML = '';
    const hourly = data.hourly;
    
    // We only display the next 24 hours from the current hour
    const currentHourIndex = new Date().getHours();
    
    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
        if (!hourly.time[i]) break;
        
        const timeVal = new Date(hourly.time[i]);
        const displayTime = timeVal.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(hourly.temperature_2m[i]);
        const pop = hourly.precipitation_probability[i];
        const wCode = hourly.weather_code[i];
        
        // Check if day or night for icon
        const hour = timeVal.getHours();
        const isDay = hour > 6 && hour < 18;
        const weatherInfo = weatherMapping[wCode] || { icon: 'cloud', iconNight: 'cloud' };
        const iconName = isDay ? weatherInfo.icon : weatherInfo.iconNight;

        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <span class="hourly-time">${displayTime}</span>
            <div class="hourly-icon"><i data-lucide="${iconName}"></i></div>
            <span class="hourly-temp">${temp}°C</span>
            <span class="hourly-pop"><i data-lucide="droplet" style="width:10px;height:10px;"></i>${pop}%</span>
        `;
        hourlyForecastList.appendChild(item);
    }
}

// Draw temperature trend chart using Chart.js
function renderChart(data) {
    const hourly = data.hourly;
    const currentHourIndex = new Date().getHours();
    const rangeSize = 12; // View next 12 hours on chart for cleanliness

    const labels = [];
    const temps = [];
    const pops = [];

    for (let i = currentHourIndex; i < currentHourIndex + rangeSize; i++) {
        if (!hourly.time[i]) break;
        const timeVal = new Date(hourly.time[i]);
        labels.push(timeVal.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
        temps.push(hourly.temperature_2m[i]);
        pops.push(hourly.precipitation_probability[i]);
    }

    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = document.getElementById('forecast-chart').getContext('2d');
    
    // Draw Gradient for line area
    const tempGradient = ctx.createLinearGradient(0, 0, 0, 250);
    tempGradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    tempGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'อุณหภูมิ (°C)',
                    data: temps,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    backgroundColor: tempGradient,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'yTemp'
                },
                {
                    label: 'โอกาสเกิดฝน (%)',
                    data: pops,
                    type: 'bar',
                    backgroundColor: 'rgba(56, 189, 248, 0.4)',
                    borderColor: '#38bdf8',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'yPop',
                    barThickness: 16
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: { family: 'Inter, Sarabun' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { family: 'Inter, Sarabun' },
                    bodyFont: { family: 'Inter, Sarabun' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter, Sarabun' }
                    }
                },
                yTemp: {
                    type: 'linear',
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter, Sarabun' },
                        callback: (value) => `${value}°`
                    },
                    title: {
                        display: true,
                        text: 'อุณหภูมิ (°C)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter, Sarabun' }
                    }
                },
                yPop: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter, Sarabun' },
                        callback: (value) => `${value}%`
                    },
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'โอกาสเกิดฝน (%)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter, Sarabun' }
                    }
                }
            }
        }
    });
}

// Populate 7-day forecast grid
function render7DayForecast(data) {
    dailyForecastListEl.innerHTML = '';
    const daily = data.daily;

    const daysTh = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    for (let i = 0; i < 7; i++) {
        if (!daily.time[i]) break;

        const dateVal = new Date(daily.time[i]);
        // Formatter for display
        let dayLabel = '';
        if (i === 0) {
            dayLabel = 'วันนี้';
        } else {
            dayLabel = `${daysTh[dateVal.getDay()]} ${dateVal.getDate()}/${dateVal.getMonth() + 1}`;
        }

        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const wCode = daily.weather_code[i];

        const weatherInfo = weatherMapping[wCode] || { desc: 'ทั่วไป', icon: 'cloud' };

        const item = document.createElement('div');
        item.className = 'daily-item';
        item.innerHTML = `
            <span class="daily-date">${dayLabel}</span>
            <div class="daily-icon"><i data-lucide="${weatherInfo.icon}"></i></div>
            <span class="daily-desc">${weatherInfo.desc}</span>
            <div class="daily-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
        `;
        dailyForecastListEl.appendChild(item);
    }
}

// Loader Toggles
function showLoader() {
    currentLoader.classList.remove('hidden');
    currentWeatherContent.classList.add('hidden');
}

function hideLoader() {
    currentLoader.classList.add('hidden');
    currentWeatherContent.classList.remove('hidden');
}
