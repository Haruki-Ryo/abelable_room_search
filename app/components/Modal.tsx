import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col ${className || ''}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal; 