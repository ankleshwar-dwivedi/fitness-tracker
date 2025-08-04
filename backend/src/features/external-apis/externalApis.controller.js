// /backend/src/features/external-apis/externalApis.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import config from '../../config/index.js';
import axios from 'axios';

// @desc    Proxy for API-Ninjas Nutrition API
// @route   GET /api/external-apis/food-nutrition?query=...
// @access  Private
const getFoodNutrition = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.status(400);
    throw new Error('Food query is required.');
  }
  if (!config.apiNinjasApiKey) {
    res.status(503); // Service Unavailable
    throw new Error('Nutrition API service is not configured on the server.');
  }

  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/nutrition', {
      params: { query },
      headers: { 'X-Api-Key': config.apiNinjasApiKey },
    });
    // The response data is an array. We will send it as is.
    res.json(response.data);
  } catch (error) {
    console.error("API-Ninjas Nutrition API Error:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500);
    throw new Error('Failed to fetch nutrition data from API-Ninjas.');
  }
});

// @desc    Proxy for API-Ninjas CaloriesBurned API
// @route   GET /api/external-apis/calories-burned?activity=...
// @access  Private
const getCaloriesBurned = asyncHandler(async (req, res) => {
  const { activity } = req.query; // Only activity is needed for this endpoint version
  if (!activity) {
    res.status(400);
    throw new Error('Activity description is required.');
  }
  if (!config.apiNinjasApiKey) {
    res.status(503);
    throw new Error('Calories Burned API service is not configured on the server.');
  }

  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/caloriesburned', {
      params: { activity },
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