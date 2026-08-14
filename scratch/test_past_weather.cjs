const fetch = require('node-fetch');

async function testPastWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-33.68&longitude=-71.21&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=14&forecast_days=7&timezone=America%2FSantiago';
    const res = await fetch(url);
    const json = await res.json();
    console.log("Time array length:", json.daily ? json.daily.time.length : 0);
    if (json.daily) {
      console.log("First 3 past days:", json.daily.time.slice(0, 3), "precip:", json.daily.precipitation_sum.slice(0, 3));
      console.log("Last 3 forecast days:", json.daily.time.slice(-3), "precip:", json.daily.precipitation_sum.slice(-3));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testPastWeather();
