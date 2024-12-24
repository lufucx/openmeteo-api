const map = L.map('map').setView([-22.8859, -42.0194], 10);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const cidades = [
    { nome: "Cabo Frio", coordenadas: [-22.8894, -42.0262] },
    { nome: "Arraial do Cabo", coordenadas: [-22.9664, -42.0276] },
    { nome: "Búzios", coordenadas: [-22.7459, -41.8817] },
    { nome: "São Pedro da Aldeia", coordenadas: [-22.8395, -42.1029] },
    { nome: "Rio das Ostras", coordenadas: [-22.5147, -41.9401] },
    { nome: "Saquarema", coordenadas: [-22.9581, -42.5204] },
    { nome: "Araruama", coordenadas: [-22.8619, -42.3371] }
];

const icons = {
    clear: L.icon({
        iconUrl: 'https://openweathermap.org/img/wn/01d.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    }),
    cloudy: L.icon({
        iconUrl: 'https://openweathermap.org/img/wn/03d.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    }),
    rainy: L.icon({
        iconUrl: 'https://openweathermap.org/img/wn/09d.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    }),
    snowy: L.icon({
        iconUrl: 'https://openweathermap.org/img/wn/13d.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    }),
    storm: L.icon({
        iconUrl: 'https://openweathermap.org/img/wn/11d.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    })
};

function interpretarWeatherCode(code) {
    const descricao = {
        0: "Céu limpo",
        1: "Principalmente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Nevoeiro",
        48: "Nevoeiro com gelo",
        51: "Chuvisco fraco",
        53: "Chuvisco moderado",
        55: "Chuvisco denso",
        61: "Chuva fraca",
        63: "Chuva moderada",
        65: "Chuva forte",
        71: "Neve fraca",
        73: "Neve moderada",
        75: "Neve forte",
        95: "Trovoada",
        96: "Trovoada com granizo",
    };
    return descricao[code] || "Condição desconhecida";
}

async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error("Erro ao buscar dados climáticos:", error);
        return null;
    }
}

async function adicionarMarcadores() {
    for (const cidade of cidades) {
        const { nome, coordenadas } = cidade;
        try {
            const data = await fetchWeatherData(coordenadas[0], coordenadas[1]);
            if (!data) {
                console.error(`Nenhuma informação de clima disponível para ${nome}.`);
                continue;
            }

            const temp = data.temperature.toFixed(1);
            const vento = data.windspeed.toFixed(1);
            const condicao = data.weathercode;
            const condicaoTexto = interpretarWeatherCode(condicao);

            let chosenIcon;
            switch (condicao) {
                case 0:
                case 1:
                case 2:
                    chosenIcon = icons.clear;
                    break;
                case 3:
                    chosenIcon = icons.cloudy;
                    break;
                case 51:
                case 53:
                case 61:
                case 63:
                case 65:
                    chosenIcon = icons.rainy;
                    break;
                case 71:
                case 73:
                case 75:
                    chosenIcon = icons.snowy;
                    break;
                case 95:
                case 96:
                    chosenIcon = icons.storm;  
                    break;
                default:
                    chosenIcon = icons.cloudy;  
            }

            L.marker(coordenadas, {
                icon: chosenIcon
            }).addTo(map)
                .bindPopup(`
                    <div class="popup-content">
                        <strong>${nome}</strong><br>
                        Temperatura: ${temp}°C<br>
                        Vento: ${vento} km/h<br>
                        Condição: ${condicaoTexto}
                    </div>
                `);
        } catch (error) {
            console.error(`Erro ao buscar dados para ${nome}:`, error);
        }
    }
}

adicionarMarcadores();