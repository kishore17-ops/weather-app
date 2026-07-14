// ---------- Config ----------
const API_KEY = "1eb3e4d9dba86597b31fb996b1253ee5";
const RECENTS_KEY = "skyline_recent_cities";
const MAX_RECENTS = 5;

// ---------- Elements ----------
const form = document.getElementById("searchForm");
const cityInput = document.getElementById("city");
const goBtn = document.getElementById("goBtn");
const spinner = document.getElementById("spinner");
const resultEl = document.getElementById("result");
const chipsEl = document.getElementById("recentChips");
const locateBtn = document.getElementById("locateBtn");
const skybar = document.getElementById("skybar");
const brandIcon = document.getElementById("brandIcon");
const greetingEl = document.getElementById("greeting");

// last fetched reading, kept in Celsius so the unit toggle can convert client-side
let lastReading = null;
let currentUnit = "C";

// ---------- Time-of-day: greeting + signature skybar ----------
function applyTimeOfDay() {
  const hour = new Date().getHours();
  let phase, label, stops;

  if (hour < 5) {
    phase = "night"; label = "🌙 Still up? Good night";
    stops = ["#080d1a", "#111827", "#1e293b"];
  } else if (hour < 8) {
    phase = "dawn"; label = "🌅 Good morning";
    stops = ["#0f1b33", "#7c5cbf", "#fb923c"];
  } else if (hour < 12) {
    phase = "morning"; label = "☀️ Good morning";
    stops = ["#1e3a5f", "#38bdf8", "#fef3c7"];
  } else if (hour < 17) {
    phase = "day"; label = "☀️ Good afternoon";
    stops = ["#1e3a5f", "#0ea5e9", "#38bdf8"];
  } else if (hour < 20) {
    phase = "dusk"; label = "🌇 Good evening";
    stops = ["#1e3a5f", "#f97316", "#7c2d92"];
  } else {
    phase = "night"; label = "🌙 Good evening";
    stops = ["#080d1a", "#1e293b", "#1e3a5f"];
  }

  document.documentElement.style.setProperty("--sky-a", stops[0]);
  document.documentElement.style.setProperty("--sky-b", stops[1]);
  document.documentElement.style.setProperty("--sky-c", stops[2]);
  greetingEl.textContent = label;
  brandIcon.innerHTML = phase === "night" ? ICONS.moonBrand : ICONS.sunBrand;
}

// ---------- Icon set (inline SVG, mapped from OpenWeather condition codes) ----------
const ICONS = {
  sunBrand: `<svg viewBox="0 0 24 24"><path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-6.66 1.42-1.42M4.92 19.08l1.42-1.42M19.08 19.08l-1.42-1.42M4.92 4.92 6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="4.5" fill="currentColor"/></svg>`,
  moonBrand: `<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor"/></svg>`,
  clearDay: `<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="14" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="13"/><line x1="32" y1="55" x2="32" y2="62"/><line x1="8" y1="34" x2="15" y2="34"/><line x1="49" y1="34" x2="56" y2="34"/><line x1="14.6" y1="16.6" x2="19.6" y2="21.6"/><line x1="44.4" y1="46.4" x2="49.4" y2="51.4"/><line x1="49.4" y1="16.6" x2="44.4" y2="21.6"/><line x1="19.6" y1="46.4" x2="14.6" y2="51.4"/></g></svg>`,
  clearNight: `<svg viewBox="0 0 64 64"><path d="M44 12a18 18 0 1 0 8 34.2A16 16 0 0 1 44 12z" fill="#e2e8f0"/><circle cx="20" cy="18" r="1.6" fill="#e2e8f0"/><circle cx="14" cy="30" r="1" fill="#e2e8f0"/></svg>`,
  clouds: `<svg viewBox="0 0 64 64"><ellipse cx="24" cy="38" rx="14" ry="10" fill="#cbd5e1"/><ellipse cx="38" cy="32" rx="17" ry="13" fill="#e2e8f0"/><ellipse cx="30" cy="42" rx="20" ry="10" fill="#f1f5f9"/></svg>`,
  rain: `<svg viewBox="0 0 64 64"><ellipse cx="24" cy="26" rx="13" ry="9" fill="#94a3b8"/><ellipse cx="38" cy="22" rx="16" ry="12" fill="#cbd5e1"/><ellipse cx="30" cy="32" rx="19" ry="9" fill="#e2e8f0"/><g stroke="#38bdf8" stroke-width="3" stroke-linecap="round"><line x1="22" y1="46" x2="18" y2="56"/><line x1="34" y1="46" x2="30" y2="56"/><line x1="46" y1="46" x2="42" y2="56"/></g></svg>`,
  thunder: `<svg viewBox="0 0 64 64"><ellipse cx="24" cy="24" rx="13" ry="9" fill="#64748b"/><ellipse cx="38" cy="20" rx="16" ry="12" fill="#94a3b8"/><ellipse cx="30" cy="30" rx="19" ry="9" fill="#cbd5e1"/><polygon points="34,38 24,54 32,54 28,62 44,44 35,44" fill="#fbbf24"/></svg>`,
  snow: `<svg viewBox="0 0 64 64"><ellipse cx="24" cy="24" rx="13" ry="9" fill="#cbd5e1"/><ellipse cx="38" cy="20" rx="16" ry="12" fill="#e2e8f0"/><ellipse cx="30" cy="30" rx="19" ry="9" fill="#f1f5f9"/><g fill="#ffffff"><circle cx="20" cy="48" r="2"/><circle cx="32" cy="52" r="2"/><circle cx="44" cy="48" r="2"/></g></svg>`,
  mist: `<svg viewBox="0 0 64 64"><g stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"><line x1="10" y1="24" x2="54" y2="24"/><line x1="6" y1="34" x2="58" y2="34"/><line x1="10" y1="44" x2="54" y2="44"/></g></svg>`,
};

function iconFor(conditionId, isDay) {
  if (conditionId >= 200 && conditionId < 300) return ICONS.thunder;
  if (conditionId >= 300 && conditionId < 600) return ICONS.rain;
  if (conditionId >= 600 && conditionId < 700) return ICONS.snow;
  if (conditionId >= 700 && conditionId < 800) return ICONS.mist;
  if (conditionId === 800) return isDay ? ICONS.clearDay : ICONS.clearNight;
  return ICONS.clouds;
}

// ---------- Recent searches ----------
function getRecents() {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY)) || []; }
  catch { return []; }
}
function saveRecent(city) {
  let list = getRecents().filter(c => c.toLowerCase() !== city.toLowerCase());
  list.unshift(city);
  list = list.slice(0, MAX_RECENTS);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(list));
  renderChips();
}
function renderChips() {
  const list = getRecents();
  chipsEl.innerHTML = "";
  list.forEach(city => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = city;
    chip.addEventListener("click", () => {
      cityInput.value = city;
      fetchWeather(city);
    });
    chipsEl.appendChild(chip);
  });
}

// ---------- Rendering ----------
function renderEmpty() {
  resultEl.innerHTML = `<p class="result-empty">Search a city to see live temperature, humidity, wind and sun times.</p>`;
}

function renderError(message) {
  resultEl.innerHTML = `
    <div class="error-box">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2zm0 6v6m0 3.2h.01" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>${message}</span>
    </div>`;
}

function formatTemp(celsius, unit) {
  const v = unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(v);
}

function renderWeather() {
  if (!lastReading) return;
  const d = lastReading;
  const unit = currentUnit;
  const unitSym = unit === "F" ? "°F" : "°C";
  const isDay = d.isDay;

  resultEl.innerHTML = `
    <div class="weather">
      <div class="w-top">
        <div class="w-place">${d.name}<span class="country">${d.country}</span></div>
        <div class="unit-toggle" role="group" aria-label="Temperature unit">
          <button type="button" data-unit="C" class="${unit === "C" ? "active" : ""}">°C</button>
          <button type="button" data-unit="F" class="${unit === "F" ? "active" : ""}">°F</button>
        </div>
      </div>
      <div class="w-main">
        <div class="w-icon">${iconFor(d.conditionId, isDay)}</div>
        <div>
          <div class="w-temp">${formatTemp(d.temp, unit)}<span style="font-size:24px;">${unitSym}</span></div>
          <div class="w-desc">${d.description}</div>
          <div class="w-feels">Feels like ${formatTemp(d.feelsLike, unit)}${unitSym}</div>
        </div>
      </div>
      <div class="w-stats">
        <div class="stat"><span class="stat-label">Humidity</span><span class="stat-value">${d.humidity}%</span></div>
        <div class="stat"><span class="stat-label">Wind</span><span class="stat-value">${d.wind} m/s</span></div>
        <div class="stat"><span class="stat-label">Pressure</span><span class="stat-value">${d.pressure} hPa</span></div>
        <div class="stat"><span class="stat-label">Sunset</span><span class="stat-value">${d.sunset}</span></div>
      </div>
    </div>
  `;

  resultEl.querySelectorAll("[data-unit]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentUnit = btn.dataset.unit;
      renderWeather();
    });
  });
}

// ---------- Loading state ----------
function setLoading(isLoading) {
  goBtn.disabled = isLoading;
  spinner.hidden = !isLoading;
  goBtn.querySelector(".btn-label").textContent = isLoading ? "Fetching…" : "Get weather";
}

// ---------- Fetch logic ----------
async function fetchWeather(city) {
  cityInput.classList.remove("invalid");
  setLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const data = await requestWeather(url);
    applyReading(data);
    saveRecent(data.name);
  } catch (err) {
    handleFetchError(err);
  } finally {
    setLoading(false);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  setLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const data = await requestWeather(url);
    applyReading(data);
    saveRecent(data.name);
    cityInput.value = data.name;
  } catch (err) {
    handleFetchError(err);
  } finally {
    setLoading(false);
  }
}

async function requestWeather(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("network");
  }
  if (response.status === 404) throw new Error("notfound");
  if (!response.ok) throw new Error("api");
  return response.json();
}

function applyReading(data) {
  const now = Date.now() / 1000;
  const isDay = now >= data.sys.sunrise && now <= data.sys.sunset;
  lastReading = {
    name: data.name,
    country: data.sys.country ? `, ${data.sys.country}` : "",
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    pressure: data.main.pressure,
    description: data.weather[0].description,
    conditionId: data.weather[0].id,
    isDay,
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  renderWeather();
}

function handleFetchError(err) {
  if (err.message === "notfound") {
    renderError("Couldn't find that city. Check the spelling and try again.");
  } else if (err.message === "network") {
    renderError("No connection right now. Check your internet and try again.");
  } else {
    renderError("Something went wrong fetching the weather. Please try again.");
  }
  cityInput.classList.add("invalid");
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    cityInput.classList.add("invalid");
    cityInput.focus();
    return;
  }
  fetchWeather(city);
});

cityInput.addEventListener("input", () => cityInput.classList.remove("invalid"));

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    renderError("Location isn't available in this browser.");
    return;
  }
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => {
      setLoading(false);
      renderError("Couldn't access your location. Search a city instead.");
    }
  );
});

// ---------- Init ----------
applyTimeOfDay();
renderChips();
renderEmpty();
