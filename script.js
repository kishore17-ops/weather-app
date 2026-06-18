const hour = new Date().getHours();

if(hour < 12){
    document.getElementById("greeting").innerText = "🌅 Good Morning";
}
else if(hour < 18){
    document.getElementById("greeting").innerText = "☀️ Good Afternoon";
}
else{
    document.getElementById("greeting").innerText = "🌙 Good Evening";
}
async function getWeather() {

    const city = document.getElementById("city").value;

    const apiKey = "1eb3e4d9dba86597b31fb996b1253ee5";

    const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("result").innerHTML = `
            <h2>🌤️ ${data.name}</h2>
            <p>🌡 Temperature: ${data.main.temp} °C</p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
            <p>☁ Condition: ${data.weather[0].description}</p>
        `;

    } catch(error) {
        document.getElementById("result").innerHTML =
        "City not found!";
    }
}