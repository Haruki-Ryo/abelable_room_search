import React from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  isError?: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, show, isError }) => {
  return (
    <div
      id="toast-notification"
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 py-2 px-5 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-transform transition-opacity duration-500 ${show ? 'show' : ''} ${isError ? 'bg-red-500' : 'bg-orange-500'} text-[var(--accent-text)]`}
      style={{ transform: show ? 'translateY(0)' : 'translateY(150%)', opacity: show ? 1 : 0 }}
    >
      <i id="toast-icon" className={`fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
      <p id="toast-message">{message}</p>
    </div>
  );
};

export default Toast; 