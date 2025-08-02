// src/components/Chatbot/ChatbotDialog.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendChatMessage } from "../../lib/apiClient";
import Button from "../Common/Button";
import Input from "../Common/Input";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

const ChatbotDialog = ({ limitedAccess }) => {
  const { user } = useAuth(); // Get the current user
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentChatState, setCurrentChatState] = useState(null); // Renamed from currentState to avoid conflict
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState("");
  const [expectsUserInput, setExpectsUserInput] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // For focusing input

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (expectsUserInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expectsUserInput]);

  const addMessageToChat = useCallback((text, sender = "bot") => {
    setMessages((prev) => [...prev, { text, sender, timestamp: Date.now() }]);
  }, []);

  const handleApiResponse = useCallback(
    (data) => {
      if (data.message) addMessageToChat(data.message);
      setOptions(data.options || []);
      setCurrentChatState(data.newState);
      setExpectsUserInput(!!data.expectsUserInput);
      // if (data.actionRequired === "PROMPT_PAGE_AUTH_ACTION") {
      //   // Could enhance this to interact with parent page, e.g., via a callback prop
      //   console.log("Chatbot suggests user to login/register using page buttons.");
      // }
    },
    [addMessageToChat]
  );

  const callChatbotApi = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError("");
      // Clear previous interactive elements
      if (!payload.userInput) setOptions([]);
      if (!payload.selectedOption) setExpectsUserInput(false);

      try {
        const res = await sendChatMessage(payload);
        handleApiResponse(res.data);
      } catch (err) {
        const errMsg =
          err.response?.data?.message ||
          "Chatbot connection error. Please try again.";
        addMessageToChat(errMsg, "error"); // Add error as a distinct message type
        setError(errMsg);
        // Optionally, reset to a safe state or offer retry
        // setCurrentChatState(limitedAccess ? "UNAUTH_INITIAL" : "INITIAL");
        // setOptions(limitedAccess ? [{text:"Start Over", nextState:"UNAUTH_INITIAL"}] : [{text:"Start Over", nextState:"INITIAL"}]);
      } finally {
        setIsLoading(false);
      }
    },
    [handleApiResponse, addMessageToChat]
  );

  const fetchInitialMessage = useCallback(() => {
    // console.log("Chatbot: Fetching initial message. Limited access:", limitedAccess);
    callChatbotApi({ currentState: null }); // Backend determines flow based on auth
  }, [callChatbotApi]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentChatState) {
      fetchInitialMessage();
    }
  }, [isOpen, messages.length, currentChatState, fetchInitialMessage]);

  const handleOptionClick = (optionText) => {
    addMessageToChat(optionText, "user");
    callChatbotApi({
      currentState: currentChatState,
      selectedOption: optionText,
    });
  };

  const handleUserInputSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    addMessageToChat(userInput, "user");
    const textToSend = userInput;
    setUserInput("");
    callChatbotApi({ currentState: currentChatState, userInput: textToSend });
  };

  const toggleChatOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0 && !currentChatState) {
      // If opening for the first time
      fetchInitialMessage();
    } else if (!isOpen && currentChatState) {
      // Re-opening, maybe refresh or just show
      // If you want to "reset" or get a fresh initial message on every open:
      // setMessages([]);
      // setCurrentChatState(null);
      // fetchInitialMessage();
    }
  };

  // --- Admin-Specific Chatbot UI ---
  if (user && user.isAdmin) {
    // For admins, we just show a simple, non-interactive welcome message.
    return (
      <div className="fixed bottom-5 right-5 w-80 bg-white rounded-xl shadow-2xl z-[100] border border-gray-200 overflow-hidden">
        <div className="bg-red-600 text-white p-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Admin Mode</h3>
        </div>
        <div className="p-4 text-center text-gray-700">
          <p>Welcome, Admin!</p>
        </div>
      </div>
    );
  }
  if (!isOpen) {
    return (
      <button
        onClick={toggleChatOpen}
        className="fixed bottom-5 right-5 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 z-[90] transition-transform hover:scale-110"
        aria-label="Open Chat Assistant"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 sm:w-96 h-[30rem] sm:h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col z-[100] border border-gray-200 overflow-hidden">
      <div className="bg-indigo-600 text-white p-3 flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-lg">FitTrack Assistant</h3>
        <button
          onClick={toggleChatOpen}
          className="text-indigo-100 hover:text-white p-1 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </div>

      <div className="flex-grow p-3 overflow-y-auto space-y-2.5 text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.timestamp}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-2.5 rounded-lg shadow-sm ${
                msg.sender === "user"
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : msg.sender === "error"
                  ? "bg-red-100 text-red-700 border border-red-200 rounded-bl-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-xs text-gray-400 py-2">
            FitTrack is thinking...
          </div>
        )}
        {/* Error state is now part of messages stream */}
        <div ref={messagesEndRef} />
      </div>

      {expectsUserInput && !isLoading && (
        <form
          onSubmit={handleUserInputSubmit}
          className="p-2.5 border-t border-gray-200 bg-gray-50 flex-shrink-0"
        >
          <Input
            ref={inputRef} // Assign ref here
            id="chatbot-user-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full text-sm !mb-0" // Override Input's default margin-bottom
            // autoFocus // autoFocus can be problematic with state changes, using ref instead
          />
          {/* <Button type="submit" variant="primary" className="w-full mt-1.5 text-sm py-2">Send</Button> */}
        </form>
      )}

      {!expectsUserInput && !isLoading && options.length > 0 && (
        <div className="p-2.5 border-t border-gray-200 space-y-1.5 bg-gray-50 flex-shrink-0">
          {options.map((opt, index) => (
            <Button
              key={index}
              variant="secondary"
              onClick={() => handleOptionClick(opt.text)}
              className="w-full text-sm py-2 justify-start text-gray-700 bg-white hover:bg-gray-100 border border-gray-300"
            >
              {opt.text}
            </Button>
          ))}
        </div>
      )}
      {error &&
        !isLoading && ( // Show general error if options/input not available
          <div className="p-2.5 border-t border-gray-200 text-xs text-red-500 bg-red-50 text-center flex-shrink-0">
            {error}{" "}
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchInitialMessage}
              className="ml-2 py-0.5 px-1.5 text-xs"
            >
              Retry
            </Button>
          </div>
        )}
    </div>
  );
};

export default ChatbotDialog;
