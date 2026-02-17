import axios from 'axios';
import logger from '../../config/logger.js';
import dotenv from 'dotenv';
dotenv.config();

class WeatherService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.OPENWEATHERMAP_API_KEY || '';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getCurrentWeather(lat: number, lon: number): Promise<any> {
        try {
            if (!this.apiKey) {
                // Return dummy data if no API key for dev
                logger.warn('OpenWeatherMap API key not found. Using mock data.');
                return this.getMockWeather();
            }

            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric',
                    lang: 'fr'
                }
            });

            return response.data;
        } catch (error: any) {
            logger.warn('OpenWeatherMap API Error (using mock):', error.response?.data || error.message);
            // Return mock data so the UI doesn't break
            return this.getMockWeather();
        }
    }

    private getMockWeather() {
        return {
            coord: { lon: 2.3522, lat: 48.8566 },
            weather: [{ id: 800, main: 'Clear', description: 'ciel dégagé', icon: '01d' }],
            base: 'stations',
            main: {
                temp: 15.5,
                feels_like: 14.8,
                temp_min: 14,
                temp_max: 17,
                pressure: 1015,
                humidity: 60
            },
            visibility: 10000,
            wind: { speed: 4.1, deg: 80 },
            clouds: { all: 0 },
            dt: 1618317040,
            sys: {
                type: 1,
                id: 6550,
                country: 'FR',
                sunrise: 1618282134,
                sunset: 1618331113
            },
            timezone: 7200,
            id: 2988507,
            name: 'Paris',
            cod: 200
        };
    }
}

export default new WeatherService();
