import { useContext } from 'react';

// Simple toast hook that can be used with the existing toast system
export const useToast = () => {
  const showToast = (toast) => {
    // This will be provided by the component that has access to setToasts
    // For now, we'll use console.warn as fallback
    console.warn('Toast:', toast);
  };

  return { showToast };
};

