// /backend/src/features/chatbot/chatbot.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import User from '../auth/user.model.js';
import MealPlan from '../mealPlans/mealPlan.model.js';
import UserWaterIntake from '../waterIntake/userWaterIntake.model.js';
import { normalizeDate } from '../../utils/dateUtils.js';
import axios from 'axios';
import config from '../../config/index.js';

// --- Helper Functions for Chatbot Actions ---
const findOrCreateMealPlan = async (userId, date) => {
  const normalized = normalizeDate(date);
  let mealPlan = await MealPlan.findOne({ userId, date: normalized });
  if (!mealPlan) {
    mealPlan = new MealPlan({ userId, date: normalized });
  }
  return mealPlan;
};

const findOrCreateWaterLog = async (userId, date) => {
    const normalized = normalizeDate(date);
    let waterLog = await UserWaterIntake.findOne({ userId, date: normalized });
    if (!waterLog) {
        waterLog = new UserWaterIntake({ userId, date: normalized, litersDrank: 0 });
    }
    return waterLog;
};


// --- Conversation State Machine ---
const conversationStates = {
  // --- Authenticated User States ---
  INITIAL: { /* ... (same as before) ... */ },
  LOG_MEAL_TYPE_SELECT: { /* ... (same as before) ... */ },
  LOG_MEAL_INPUT: {
    message: (context) => `Okay, logging ${context.mealType}. What did you eat?`,
    expectsUserInput: true,
    nextStateOnInput: "FETCHING_CALORIES", // NEW: Go to a state that fetches calorie data
    options: [{ text: "Cancel Meal Log", nextState: "LOG_MEAL_TYPE_SELECT" }],
  },
  FETCHING_CALORIES: {
    // This is a "service" state. It performs an action and immediately transitions.
    // It doesn't have a message of its own.
    action: async (context) => {
        if (!config.calorieNinjasApiKey) {
            console.warn("Chatbot: CalorieNinjas API key not set. Skipping calorie lookup.");
            // Fallback: Add with 0 calories
            const foodItem = { description: context.userInput, calories: 0 };
            return { nextState: "SAVE_MEAL_ITEM", context: { ...context, foodItem } };
        }
        try {
            const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
                params: { query: context.userInput },
                headers: { 'X-Api-Key': config.calorieNinjasApiKey },
            });
            if (response.data.items && response.data.items.length > 0) {
                // For simplicity, take the first item. A more complex flow could ask the user to choose.
                const nutritionInfo = response.data.items[0];
                const foodItem = {
                    description: context.userInput,
                    calories: nutritionInfo.calories || 0,
                    protein_g: nutritionInfo.protein_g || 0,
                    carbohydrates_total_g: nutritionInfo.carbohydrates_total_g || 0,
                    fat_total_g: nutritionInfo.fat_total_g || 0,
                    serving_size_g: nutritionInfo.serving_size_g || 100,
                };
                return { nextState: "CONFIRM_MEAL_ADD", context: { ...context, foodItem } };
            } else { // API returned no items
                const foodItem = { description: context.userInput, calories: 0 };
                return { nextState: "CONFIRM_MEAL_ADD", context: { ...context, foodItem, warning: "Could not find calorie information." } };
            }
        } catch (error) {
            console.error("Chatbot: Error fetching from CalorieNinjas:", error.message);
            const foodItem = { description: context.userInput, calories: 0 };
            return { nextState: "CONFIRM_MEAL_ADD", context: { ...context, foodItem, warning: "Could not reach the nutrition service." } };
        }
    }
  },
  CONFIRM_MEAL_ADD: {
      message: (context) => {
          let msg = `Found it! "${context.foodItem.description}" has approximately ${Math.round(context.foodItem.calories)} calories. Add this to your ${context.mealType}?`;
          if (context.warning) {
              msg = `${context.warning} I'll log "${context.userInput}" with 0 calories. Add this to your ${context.mealType}?`;
          }
          return msg;
      },
      options: [
          { text: "Yes, add it", nextState: "SAVE_MEAL_ITEM" },
          { text: "No, cancel", nextState: "LOG_MEAL_TYPE_SELECT" }
      ]
  },
  SAVE_MEAL_ITEM: {
      action: async (context) => {
          try {
              const mealPlan = await findOrCreateMealPlan(context.userId, new Date());
              const mealKey = context.mealType.toLowerCase(); // 'breakfast', 'lunch', etc.
              if (!mealPlan[mealKey]) { mealPlan[mealKey] = { items: [], totalCalories: 0 }; }
              mealPlan[mealKey].items.push(context.foodItem);
              await mealPlan.save();
              return { nextState: "LOG_MEAL_SUCCESS", context };
          } catch (error) {
              console.error("Chatbot: DB error saving meal item:", error);
              return { nextState: "AUTH_ERROR", context: { ...context, errorMessage: "Failed to save your meal."} };
          }
      }
  },
  LOG_MEAL_SUCCESS: {
      message: (context) => `Added "${context.foodItem.description}" to your ${context.mealType}. What's next?`,
      options: [
          { text: "Log Another Meal", nextState: "LOG_MEAL_TYPE_SELECT" },
          { text: "Back to Main Menu", nextState: "INITIAL" }
      ]
  },
  LOG_WATER_PROMPT: { /* ... (same as before) ... */ },
  LOG_WATER_INVALID_INPUT: { /* ... (same as before) ... */ },
  LOG_WATER_SAVE_CONFIRM: {
      action: async (context) => {
          try {
              const waterLog = await findOrCreateWaterLog(context.userId, new Date());
              waterLog.litersDrank = parseFloat(context.userInput);
              await waterLog.save();
              return { nextState: "LOG_WATER_SUCCESS", context };
          } catch (error) {
              console.error("Chatbot: DB error saving water log:", error);
              return { nextState: "AUTH_ERROR", context: { ...context, errorMessage: "Failed to save your water intake."} };
          }
      }
  },
  LOG_WATER_SUCCESS: {
      message: (context) => `Great! Logged ${context.userInput} liters of water for today. Keep it up!`,
      options: [{ text: "Back to Main Menu", nextState: "INITIAL" }]
  },

  // ... (Other states like AUTH_ERROR, UNAUTH_INITIAL, etc.)
};

const processChatbotMessage = asyncHandler(async (req, res) => {
  let { currentState, selectedOption, userInput } = req.body;
  const authenticatedUser = req.user;

  let userContextName = "Guest";
  let initialEntryState = "UNAUTH_INITIAL";
  let errorFallbackState = "UNAUTH_ERROR";
  let userId = null;

  if (authenticatedUser) {
    userContextName = authenticatedUser.name;
    initialEntryState = "INITIAL";
    errorFallbackState = "AUTH_ERROR";
    userId = authenticatedUser._id;
  }

  let nextStateKey = currentState || initialEntryState;
  let responseContext = { userName: userContextName, userId };

  // --- Main State Machine Loop ---
  while (true) {
    const stateDefinition = conversationStates[nextStateKey];
    if (!stateDefinition) {
        console.warn(`Chatbot: Invalid state key '${nextStateKey}'. Falling back.`);
        nextStateKey = errorFallbackState;
        continue; // Restart loop with fallback state
    }

    // If it's a "service" state with an action, execute it
    if (typeof stateDefinition.action === 'function') {
        const result = await stateDefinition.action(responseContext);
        nextStateKey = result.nextState;
        responseContext = { ...responseContext, ...result.context }; // Update context
        // Continue the loop to process the *new* state
        continue;
    }

    // If it's an interactive state, prepare response for frontend
    // Process user input (option or text) to determine the *next* state for the next request
    if (currentState && (selectedOption || userInput !== undefined)) {
        if (selectedOption && stateDefinition.options) {
            const chosenOpt = stateDefinition.options.find(o => o.text === selectedOption);
            if (chosenOpt) {
                nextStateKey = chosenOpt.nextState;
                if (chosenOpt.context) {
                    responseContext = { ...responseContext, ...chosenOpt.context };
                }
            } else { nextStateKey = errorFallbackState; }
        } else if (userInput !== undefined && stateDefinition.expectsUserInput) {
            // ... (Handle water validation as before) ...
            nextStateKey = stateDefinition.nextStateOnInput || errorFallbackState;
            responseContext = { ...responseContext, userInput };
        }
        // This block determines the next state, but we break to send the current state's message back first.
        // The logic is now inverted: the current request resolves the *previous* action.
    }
    
    // Break the loop to send the response for the current interactive state
    let messageText = typeof stateDefinition.message === 'function' ? stateDefinition.message(responseContext) : stateDefinition.message;
    res.json({
        newState: nextStateKey,
        message: messageText,
        options: stateDefinition.options || [],
        expectsUserInput: !!stateDefinition.expectsUserInput,
    });
    return; // Exit the handler
  }
});

export { processChatbotMessage };