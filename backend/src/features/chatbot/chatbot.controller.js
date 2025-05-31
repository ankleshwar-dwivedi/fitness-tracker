// /backend/src/features/chatbot/chatbot.controller.js
import asyncHandler from "../../middleware/asyncHandler.js";
import User from "../auth/user.model.js";

// Simple state machine for conversation flow
const conversationStates = {
  INITIAL: {
    message: (userName) => `Hi ${userName}! I'm your FitTrack assistant. How can I help you today?`,
    options: [
      { text: "Log Meal", nextState: "LOG_MEAL_START" },
      { text: "Log Water", nextState: "LOG_WATER_START" },
      { text: "View Today's Plan", nextState: "VIEW_PLAN" },
    ],
  },
  LOG_MEAL_START: {
    message: "Great! Which meal would you like to log?",
    options: [
      { text: "Breakfast", nextState: "LOG_MEAL_DETAILS", context: { mealType: "meal1" } },
      { text: "Lunch", nextState: "LOG_MEAL_DETAILS", context: { mealType: "meal2" } },
      { text: "Dinner", nextState: "LOG_MEAL_DETAILS", context: { mealType: "meal3" } },
      { text: "Snack", nextState: "LOG_MEAL_DETAILS", context: { mealType: "snacks" } },
      { text: "Back", nextState: "INITIAL" },
    ],
  },
  LOG_MEAL_DETAILS: {
    message: (context) => `Okay, ${context.mealType}. What did you eat? (You can describe it briefly for now. We'll integrate with meal planning later!)`,
    expectsUserInput: true, // Indicates frontend should show a text input
    nextStateOnInput: "LOG_MEAL_CONFIRM", // State to go to after user types something
    options: [{ text: "Cancel", nextState: "INITIAL" }],
  },
  LOG_MEAL_CONFIRM: {
    message: (context) => `Got it: "${context.userInput}" for ${context.mealType}. I've noted this down (conceptually for now!). Anything else?`,
    // In a real scenario, you'd save this to the meal plan here
    options: [
      { text: "Log Another Meal", nextState: "LOG_MEAL_START" },
      { text: "Back to Main Menu", nextState: "INITIAL" },
    ],
  },
  LOG_WATER_START: {
    message: "Sure, how many liters of water did you drink?",
    expectsUserInput: true,
    nextStateOnInput: "LOG_WATER_CONFIRM",
    options: [{ text: "Cancel", nextState: "INITIAL" }],
  },
  LOG_WATER_CONFIRM: {
    message: (context) => `Logged ${context.userInput} liters of water. Stay hydrated!`,
    // In a real scenario, you'd save this to water intake
    options: [
      { text: "Back to Main Menu", nextState: "INITIAL" },
    ],
  },
  VIEW_PLAN: {
    message: "Showing today's plan... (This feature will be fully built out soon!)",
    options: [{ text: "Back", nextState: "INITIAL" }],
  },
  ERROR: {
    message: "Sorry, I didn't understand that. Please choose an option.",
    options: [{ text: "Start Over", nextState: "INITIAL" }],
  }
};

const processChatbotMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentState, selectedOption, userInput } = req.body; // `userInput` for text entries

  let user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let nextStateKey = currentState || "INITIAL";
  let responseContext = { userName: user.name };

  if (currentState && selectedOption && conversationStates[currentState]) {
    const chosenOpt = conversationStates[currentState].options.find(o => o.text === selectedOption);
    if (chosenOpt) {
      nextStateKey = chosenOpt.nextState;
      if (chosenOpt.context) {
        responseContext = { ...responseContext, ...chosenOpt.context };
      }
    } else {
      nextStateKey = "ERROR"; // Invalid option selected
    }
  } else if (currentState && userInput && conversationStates[currentState] && conversationStates[currentState].expectsUserInput) {
    // User provided text input as expected by the current state
    nextStateKey = conversationStates[currentState].nextStateOnInput;
    responseContext = { ...responseContext, ...conversationStates[currentState].context, userInput };
  } else if (!currentState && !user.hasInteractedWithChatbot) {
    // First interaction for a new user
    nextStateKey = "INITIAL";
    user.hasInteractedWithChatbot = true;
    await user.save();
  } else if (!currentState && user.hasInteractedWithChatbot) {
    // User re-opened chat, resume from initial or last known state (simplifying to INITIAL)
    nextStateKey = "INITIAL";
  }


  const stateDefinition = conversationStates[nextStateKey] || conversationStates["INITIAL"];
  let messageText = typeof stateDefinition.message === 'function'
    ? stateDefinition.message(responseContext)
    : stateDefinition.message;

  res.json({
    newState: nextStateKey,
    message: messageText,
    options: stateDefinition.options || [],
    expectsUserInput: !!stateDefinition.expectsUserInput,
    context: responseContext // Send back context for frontend if needed
  });
});

export { processChatbotMessage };