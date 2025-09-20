import React from "react";

const Modal = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-lg font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-black mb-4">{title}</h2>
        <div className="text-sm text-gray-800 overflow-y-auto max-h-[60vh]">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Modal;
