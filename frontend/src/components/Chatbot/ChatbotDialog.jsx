// src/components/Chatbot/ChatbotDialog.jsx
import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../../lib/apiClient';
import Button from '../Common/Button';
import Input from '../Common/Input'; // For text input

const ChatbotDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentState, setCurrentState] = useState(null); // Start with null to trigger initial message
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInput, setUserInput] = useState('');
  const [expectsUserInput, setExpectsUserInput] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleInitialMessage = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await sendChatMessage({ currentState: null }); // Send null to get initial state
      addMessage(res.data.message);
      setOptions(res.data.options);
      setCurrentState(res.data.newState);
      setExpectsUserInput(res.data.expectsUserInput);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Chatbot error. Please try again.";
      addMessage(errMsg);
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial message when chatbot opens for the first time or is reset
  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentState) {
      handleInitialMessage();
    }
  }, [isOpen, messages.length, currentState]);


  const handleOptionClick = async (optionText) => {
    addMessage(optionText, 'user');
    setIsLoading(true);
    setError('');
    setOptions([]); // Clear options while waiting for response
    setExpectsUserInput(false);

    try {
      const res = await sendChatMessage({ currentState, selectedOption: optionText });
      addMessage(res.data.message);
      setOptions(res.data.options);
      setCurrentState(res.data.newState);
      setExpectsUserInput(res.data.expectsUserInput);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Chatbot error. Please try again.";
      addMessage(errMsg);
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInputSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    addMessage(userInput, 'user');
    const currentInput = userInput;
    setUserInput(''); // Clear input field
    setIsLoading(true);
    setError('');
    setOptions([]);
    setExpectsUserInput(false);

    try {
      const res = await sendChatMessage({ currentState, userInput: currentInput });
      addMessage(res.data.message);
      setOptions(res.data.options);
      setCurrentState(res.data.newState);
      setExpectsUserInput(res.data.expectsUserInput);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Chatbot error. Please try again.";
      addMessage(errMsg);
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        aria-label="Open Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 h-[28rem] bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-300">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
        <h3 className="font-semibold">FitTrack Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      <div className="flex-grow p-3 overflow-y-auto space-y-2 text-sm">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] p-2 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-500">Thinking...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {expectsUserInput && !isLoading && (
        <form onSubmit={handleUserInputSubmit} className="p-2 border-t border-gray-200">
          <Input
            id="chatbot-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response..."
            className="w-full text-sm"
            autoFocus
          />
          <Button type="submit" variant="primary" className="w-full mt-1 text-sm py-1.5">Send</Button>
        </form>
      )}

      {!expectsUserInput && !isLoading && options.length > 0 && (
        <div className="p-2 border-t border-gray-200 space-y-1">
          {options.map((opt, index) => (
            <Button
              key={index}
              variant="secondary"
              onClick={() => handleOptionClick(opt.text)}
              className="w-full text-sm py-1.5 justify-start"
            >
              {opt.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatbotDialog;