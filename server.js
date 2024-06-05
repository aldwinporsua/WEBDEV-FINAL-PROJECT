const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const apiKey = '3b559440aabdcd7940158c542095da17';
const cities = ['Manila', 'Legazpi', 'Naga', 'Quezon City', 'Cebu City', 'Davao City', 'Zamboanga City', 'Taguig', 'Pasig', 'Antipolo', 'Cagayan de Oro', 'Parañaque'];

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const getWeatherForCity = async (city) => {
    const fetch = await import('node-fetch').then(mod => mod.default);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    };
};

const broadcastWeatherUpdates = async () => {
    const randomCities = cities.sort(() => 0.5 - Math.random()).slice(0, 3);
    const weatherUpdates = await Promise.all(randomCities.map(city => getWeatherForCity(city)));

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(weatherUpdates));
        }
    });
};

setInterval(broadcastWeatherUpdates, 600000);
broadcastWeatherUpdates(); 

console.log('WebSocket server is running on ws://localhost:8080');
