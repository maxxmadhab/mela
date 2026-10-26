import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          transform: toastMessage ? 'translate(-50%, 0)' : 'translate(-50%, 120px)',
          backgroundColor: 'var(--charcoal)',
          color: 'var(--ivory)',
          padding: '12px 24px',
          borderRadius: '99px',
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          zIndex: 95,
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        {toastMessage}
      </div>
    </ToastContext.Provider>
  );
};
