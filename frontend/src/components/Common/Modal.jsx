// src/components/Common/Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Effect to handle the 'Escape' key press to close the modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    // The main modal container: a fixed overlay that covers the entire screen
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose} // Close modal if the overlay is clicked
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all"
        // Stop click propagation to prevent the modal from closing when clicking inside it
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;