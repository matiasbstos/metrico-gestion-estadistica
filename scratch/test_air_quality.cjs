const fetch = require('node-fetch');

async function testAirQuality() {
  try {
    const url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-33.68&longitude=-71.21&hourly=pm10,pm2_5,european_aqi&timezone=America%2FSantiago';
    const res = await fetch(url);
    const json = await res.json();
    console.log("Air Quality Response Keys:", Object.keys(json));
    if (json.hourly) {
      console.log("Hourly PM2.5 (first 5):", json.hourly.pm2_5 ? json.hourly.pm2_5.slice(0, 5) : 'N/A');
      console.log("Hourly PM10 (first 5):", json.hourly.pm10 ? json.hourly.pm10.slice(0, 5) : 'N/A');
      console.log("Hourly AQI (first 5):", json.hourly.european_aqi ? json.hourly.european_aqi.slice(0, 5) : 'N/A');
    }
  } catch (e) {
    console.error("Error fetching air quality:", e.message);
  }
}

testAirQuality();
