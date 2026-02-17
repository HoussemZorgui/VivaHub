import axios from 'axios';
import logger from '../../config/logger.js';
import dotenv from 'dotenv';
dotenv.config();

class NutritionService {
    private appId: string;
    private apiKey: string;
    private foodDbUrl: string;
    private nutritionUrl: string;

    constructor() {
        this.appId = process.env.EDAMAM_APP_ID || '';
        this.apiKey = process.env.EDAMAM_APP_KEY || '';
        this.foodDbUrl = 'https://api.edamam.com/api/food-database/v2';
        this.nutritionUrl = 'https://api.edamam.com/api/nutrition-data';
    }

    async searchFood(query: string) {
        try {
            if (!this.appId || !this.apiKey) {
                logger.warn('Edamam Keys missing. Using mock data.');
                return this.getMockSearch(query);
            }

            // Using Edamam Content/Food Database API for search suggestions
            const response = await axios.get(`${this.foodDbUrl}/parser`, {
                params: {
                    app_id: this.appId,
                    app_key: this.apiKey,
                    ingr: query
                }
            });

            // Map Edamam hints to Nutritionix-like structure to maintain frontend compatibility
            const hints = response.data.hints || [];
            const common = hints.map((hint: any) => ({
                food_name: hint.food.label,
                photo: {
                    thumb: hint.food.image || 'https://d2eawub7utve6.cloudfront.net/content/images/system/default_food.jpg'
                },
                serving_unit: hint.measures?.[0]?.label || 'serving',
                serving_qty: 1,
                // Edamam provides basic nutrients in hints too, can be useful
                nf_calories: hint.food.nutrients?.ENERC_KCAL,
                tag_id: hint.food.foodId
            }));

            return {
                common,
                branded: [] // Edamam doesn't strictly separate branded in the same way, put all in common
            };
        } catch (error: any) {
            logger.error('Edamam Search Error:', error.response?.data || error.message);
            return this.getMockSearch(query);
        }
    }

    async getNutrients(query: string) {
        try {
            if (!this.appId || !this.apiKey) {
                return this.getMockNutrients(query);
            }

            // Step 1: Search for the food first to get the Image
            // Default to LoremFlickr for reliable food images
            const encodedQuery = encodeURIComponent(query);
            let imageUrl = `https://loremflickr.com/320/240/${encodedQuery},food/all`;

            try {
                const searchResponse = await axios.get(`${this.foodDbUrl}/parser`, {
                    params: {
                        app_id: this.appId,
                        app_key: this.apiKey,
                        ingr: query
                    }
                });

                if (searchResponse.data.hints && searchResponse.data.hints.length > 0) {
                    const bestMatch = searchResponse.data.hints[0];
                    if (bestMatch.food.image) {
                        imageUrl = bestMatch.food.image;
                        logger.info(`Edamam Image Found for ${query}: ${imageUrl}`);
                    }
                }
            } catch (e) {
                logger.warn(`Edamam Image Search Failed. Using LoremFlickr fallback: ${imageUrl}`);
            }

            // Using Edamam Nutrition Analysis API
            const response = await axios.get(this.nutritionUrl, {
                params: {
                    app_id: this.appId,
                    app_key: this.apiKey,
                    ingr: query
                }
            });

            if (!response.data || (!response.data.calories && !response.data.totalNutrients)) {
                // If analysis fails (e.g. unknown food), try to search and get first result's nutrition
                // For now, return mock or empty
                return this.getMockNutrients(query);
            }

            const data = response.data;

            // Map to Nutritionix structure: { foods: [...] }
            return {
                foods: [
                    {
                        food_name: query,
                        serving_qty: data.totalWeight || 100,
                        serving_unit: "g", // Edamam returns totalWeight in grams typically
                        serving_weight_grams: data.totalWeight,
                        nf_calories: data.calories,
                        nf_total_fat: data.totalNutrients.FAT?.quantity || 0,
                        nf_saturated_fat: data.totalNutrients.FASAT?.quantity || 0,
                        nf_cholesterol: data.totalNutrients.CHOLE?.quantity || 0,
                        nf_sodium: data.totalNutrients.NA?.quantity || 0,
                        nf_total_carbohydrate: data.totalNutrients.CHOCDF?.quantity || 0,
                        nf_dietary_fiber: data.totalNutrients.FIBTG?.quantity || 0,
                        nf_sugars: data.totalNutrients.SUGAR?.quantity || 0,
                        nf_protein: data.totalNutrients.PROCNT?.quantity || 0,
                        nf_potassium: data.totalNutrients.K?.quantity || 0,
                        photo: {
                            thumb: imageUrl
                        }
                    }
                ]
            };

        } catch (error: any) {
            logger.error('Edamam Nutrients Error:', error.response?.data || error.message);
            return this.getMockNutrients(query);
        }
    }

    private getMockSearch(query: string) {
        return {
            common: [
                { food_name: `${query} (Generic)`, photo: { thumb: 'https://d2eawub7utve6.cloudfront.net/content/images/system/default_food.jpg' } }
            ],
            branded: []
        };
    }

    private getMockNutrients(query: string) {
        return {
            foods: [
                {
                    food_name: query,
                    serving_qty: 1,
                    serving_unit: "medium",
                    serving_weight_grams: 182,
                    nf_calories: 95,
                    nf_total_fat: 0.3,
                    nf_saturated_fat: 0.1,
                    nf_cholesterol: 0,
                    nf_sodium: 2,
                    nf_total_carbohydrate: 25,
                    nf_dietary_fiber: 4.4,
                    nf_sugars: 19,
                    nf_protein: 0.5,
                    nf_potassium: 195,
                    photo: {
                        thumb: "https://d2eawub7utve6.cloudfront.net/content/images/system/default_food.jpg"
                    }
                }
            ]
        };
    }
}

export default new NutritionService();
