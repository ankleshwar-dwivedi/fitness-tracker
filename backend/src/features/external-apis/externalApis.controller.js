// /backend/src/features/external-apis/externalApis.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import config from '../../config/index.js';
import axios from 'axios';

// @desc    Proxy for CalorieNinjas API to get food nutrition
// @route   GET /api/external-apis/food-nutrition?query=...
// @access  Private
const getFoodNutrition = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.status(400);
    throw new Error('Food query is required.');
  }
  if (!config.calorieNinjasApiKey) {
    res.status(503); // Service Unavailable
    throw new Error('Nutrition API service is not configured on the server.');
  }

  try {
    const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
      params: { query },
      headers: { 'X-Api-Key': config.calorieNinjasApiKey },
    });
    res.json(response.data);
  } catch (error) {
    console.error("CalorieNinjas API Error:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500);
    throw new Error('Failed to fetch nutrition data.');
  }
});

// @desc    Proxy for API-Ninjas CaloriesBurned API
// @route   GET /api/external-apis/calories-burned?activity=...&duration=...&weight=...
// @access  Private
const getCaloriesBurned = asyncHandler(async (req, res) => {
  const { activity, duration_min, weight_kg } = req.query;
  if (!activity) {
    res.status(400);
    throw new Error('Activity description is required.');
  }
  if (!config.apiNinjasApiKey) {
    res.status(503); // Service Unavailable
    throw new Error('Calories Burned API service is not configured on the server.');
  }

  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/caloriesburned', {
      params: { activity, duration: duration_min, weight: weight_kg }, // API expects 'duration' and 'weight'
      headers: { 'X-Api-Key': config.apiNinjasApiKey },
    });
    res.json(response.data);
  } catch (error) {
    console.error("API-Ninjas CaloriesBurned Error:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500);
    throw new Error('Failed to fetch calories burned data.');
  }
});

export { getFoodNutrition, getCaloriesBurned };