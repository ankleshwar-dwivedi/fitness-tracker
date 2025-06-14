// /backend/src/features/chatbot/chatbot.controller.js
import asyncHandler from "../../middleware/asyncHandler.js";
import User from "../auth/user.model.js";
// import { getLocalDateString, normalizeDate } from '../../utils/dateUtils'; // Assuming you create this util
// import MealPlan from '../mealPlans/mealPlan.model.js'; // For actual DB operations

// --- Helper for date (create utils/dateUtils.js if you don't have one) ---
const getLocalDateString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0); // Normalize to UTC start of day
  return date;
};
// --- End Helper ---


const conversationStates = {
  // --- Authenticated User States ---
  INITIAL: {
    message: (context) => `Hi ${context.userName}! I'm your FitTrack assistant. How can I help you today?`,
    options: [
      { text: "Log Meal", nextState: "LOG_MEAL_TYPE_SELECT" },
      { text: "Log Water", nextState: "LOG_WATER_PROMPT" },
      // { text: "View Today's Plan", nextState: "VIEW_PLAN_SUMMARY" }, // For future
    ],
  },
  LOG_MEAL_TYPE_SELECT: { // Renamed from LOG_MEAL_START
    message: "Great! Which meal would you like to log for today?",
    options: [
      { text: "Breakfast", nextState: "LOG_MEAL_INPUT", context: { mealType: "Breakfast", mealTypeKey: "meal1"} },
      { text: "Lunch", nextState: "LOG_MEAL_INPUT", context: { mealType: "Lunch", mealTypeKey: "meal2" } },
      { text: "Dinner", nextState: "LOG_MEAL_INPUT", context: { mealType: "Dinner", mealTypeKey: "meal3" } },
      { text: "Snacks", nextState: "LOG_MEAL_INPUT", context: { mealType: "Snacks", mealTypeKey: "snacks"} },
      { text: "Back to Menu", nextState: "INITIAL" },
    ],
  },
  LOG_MEAL_INPUT: { // Renamed from LOG_MEAL_DETAILS
    message: (context) => `Okay, logging ${context.mealType}. What did you have?`,
    expectsUserInput: true,
    nextStateOnInput: "LOG_MEAL_SAVE_CONFIRM", // This state will use the context
    options: [{ text: "Cancel Meal Log", nextState: "LOG_MEAL_TYPE_SELECT" }],
  },
  LOG_MEAL_SAVE_CONFIRM: { // Renamed and simplified
    message: (context) => `Noted: "${context.userInput}" for ${context.mealType}. (Conceptual log for now). Anything else for meals?`,
    // In a real scenario, API call to save meal would happen before this message
    options: [
      { text: "Log Another Meal", nextState: "LOG_MEAL_TYPE_SELECT" },
      { text: "Back to Main Menu", nextState: "INITIAL" },
    ],
  },
  LOG_WATER_PROMPT: { // Renamed from LOG_WATER_START
    message: "Sure, how many liters of water did you drink today?",
    expectsUserInput: true,
    nextStateOnInput: "LOG_WATER_SAVE_CONFIRM", // Validation will happen before this state
    options: [{ text: "Cancel Water Log", nextState: "INITIAL" }],
  },
  LOG_WATER_INVALID_INPUT: {
      message: (context) => `Hmm, "${context.originalInput}" doesn't seem like a valid number for liters. Please enter a positive number (e.g., 1.5 or 2).`,
      options: [
          { text: "Try Again", nextState: "LOG_WATER_PROMPT" },
          { text: "Cancel Water Log", nextState: "INITIAL" },
      ],
  },
  LOG_WATER_SAVE_CONFIRM: { // Renamed
    message: (context) => `Great! Logged ${context.userInput} liters of water for today. (Conceptual log). Keep it up!`,
    // In a real scenario, API call to save water would happen
    options: [{ text: "Back to Main Menu", nextState: "INITIAL" }],
  },
  AUTH_ERROR: { // General error for authenticated flow
    message: (context) => `Sorry ${context.userName}, I had a little hiccup. Let's try from the main menu.`,
    options: [{ text: "Main Menu", nextState: "INITIAL" }],
  },

  // --- Unauthenticated (Guest) User States ---
  UNAUTH_INITIAL: {
    message: "Welcome to FitTrack! I'm a quick assistant. How can I help you as a guest?",
    options: [
      { text: "What can FitTrack do?", nextState: "UNAUTH_ABOUT_APP" },
      { text: "How do I get started?", nextState: "UNAUTH_HOW_TO_START" },
      // Not offering direct login/register via chatbot options, as UI handles it better
    ],
  },
  UNAUTH_ABOUT_APP: {
    message: "FitTrack helps you easily log meals, track water intake, monitor your fitness stats, and even sync with your Google Calendar for reminders! Create a free account to unlock all features.",
    options: [
      { text: "How do I sign up?", nextState: "UNAUTH_HOW_TO_START" },
      { text: "Back to Guest Menu", nextState: "UNAUTH_INITIAL" },
    ],
  },
  UNAUTH_HOW_TO_START: {
    message: "Getting started is simple! Just click the 'Get Started for FREE' or 'Register' button on our page to create your account. If you already have one, you can log in.",
    options: [
      { text: "What can FitTrack do?", nextState: "UNAUTH_ABOUT_APP" },
      { text: "Got it!", nextState: "UNAUTH_INITIAL_PROMPT_ACTION" }, // To encourage action
    ],
  },
  UNAUTH_INITIAL_PROMPT_ACTION: {
      message: "Ready to take control of your fitness? Use the buttons on the page to sign up or log in!",
      options: [{ text: "Okay", nextState: "UNAUTH_INITIAL" }], // Returns to guest menu
      actionRequired: "PROMPT_PAGE_AUTH_ACTION" // Hint for frontend to maybe highlight page buttons
  },
  UNAUTH_ERROR: {
    message: "Oops, something went a bit sideways. Let's start over with the guest menu.",
    options: [{ text: "Guest Menu", nextState: "UNAUTH_INITIAL" }],
  }
};

const processChatbotMessage = asyncHandler(async (req, res) => {
  const { currentState, selectedOption, userInput } = req.body;
  const authenticatedUser = req.user; // Provided by 'protect' middleware IF route is protected

  let userContextName = "Guest";
  let currentStatesSource = conversationStates; // Default to full states
  let initialEntryState = "UNAUTH_INITIAL";
  let errorFallbackState = "UNAUTH_ERROR";

  if (authenticatedUser) {
    userContextName = authenticatedUser.name;
    initialEntryState = "INITIAL";
    errorFallbackState = "AUTH_ERROR";
    // Check for first interaction for authenticated user
    if (!currentState && !authenticatedUser.hasInteractedWithChatbot) {
        try {
            const userToUpdate = await User.findById(authenticatedUser._id);
            if (userToUpdate) {
                userToUpdate.hasInteractedWithChatbot = true;
                await userToUpdate.save();
            }
        } catch (saveError) { console.error("Error updating hasInteractedWithChatbot:", saveError); }
    }
  }

  let nextStateKey = currentState || initialEntryState;
  // Initialize context for message functions. Always include userName.
  // Specific option/input contexts will be merged into this.
  let responseContext = { userName: userContextName };


  // 1. Process selected option
  if (currentState && selectedOption && currentStatesSource[currentState]?.options) {
    const chosenOpt = currentStatesSource[currentState].options.find(o => o.text === selectedOption);
    if (chosenOpt) {
      nextStateKey = chosenOpt.nextState;
      if (chosenOpt.context) {
        responseContext = { ...responseContext, ...chosenOpt.context }; // Merge option context
      }
    } else {
      nextStateKey = errorFallbackState; // Invalid option chosen
    }
  }
  // 2. Process user text input (if an option wasn't selected)
  else if (currentState && userInput !== undefined && currentStatesSource[currentState]?.expectsUserInput) {
    // Add current context (like mealType) to responseContext before adding userInput
    if(currentStatesSource[currentState].context) {
        responseContext = { ...responseContext, ...currentStatesSource[currentState].context };
    }
    responseContext.userInput = userInput; // Add the actual user input

    // Specific validation for water intake
    if (currentState === "LOG_WATER_PROMPT" && authenticatedUser) {
        const liters = parseFloat(userInput);
        if (isNaN(liters) || liters <= 0) { // Water must be positive
            nextStateKey = "LOG_WATER_INVALID_INPUT";
            responseContext.originalInput = userInput; // For error message
            delete responseContext.userInput; // Don't pass invalid userInput to next state
        } else {
            nextStateKey = currentStatesSource[currentState].nextStateOnInput || errorFallbackState;
            responseContext.userInput = liters.toString(); // Validated and stringified
            // --- Conceptual DB Operation for Water ---
            // console.log(`TODO: Save water ${liters}L for user ${authenticatedUser._id} for today`);
        }
    }
    // Conceptual DB Operation for Meal (after input, before confirm message)
    else if (currentState === "LOG_MEAL_INPUT" && authenticatedUser && responseContext.mealTypeKey) {
        nextStateKey = currentStatesSource[currentState].nextStateOnInput || errorFallbackState;
        // console.log(`TODO: Save meal: User ${authenticatedUser._id}, Date: ${getLocalDateString(new Date())}, ${responseContext.mealTypeKey}: "${userInput}"`);
    }
    // Generic handling for other user inputs
    else {
        nextStateKey = currentStatesSource[currentState].nextStateOnInput || errorFallbackState;
    }
  }
  // 3. Handle initial message if no currentState (e.g., chat just opened)
  else if (!currentState) {
    nextStateKey = initialEntryState;
  }
  // 4. If somehow still no valid nextStateKey, fallback
  else if (!currentStatesSource[nextStateKey]) {
      console.warn(`Chatbot: Invalid nextStateKey derived: ${nextStateKey}. Falling back.`);
      nextStateKey = errorFallbackState;
  }


  const stateDefinition = currentStatesSource[nextStateKey] || currentStatesSource[initialEntryState];

  let messageText = typeof stateDefinition.message === 'function'
    ? stateDefinition.message(responseContext)
    : stateDefinition.message;

  res.json({
    newState: nextStateKey,
    message: messageText,
    options: typeof stateDefinition.options === 'function' ? stateDefinition.options(responseContext) : (stateDefinition.options || []),
    expectsUserInput: !!stateDefinition.expectsUserInput,
    actionRequired: stateDefinition.actionRequired || null,
  });
});

export { processChatbotMessage };