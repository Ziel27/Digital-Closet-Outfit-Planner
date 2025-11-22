import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children, userTheme }) => {
  // Get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Apply theme to HTML element
  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    const resolved = themeValue === 'system' ? getSystemTheme() : themeValue;
    
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    return resolved;
  };

  const [theme, setTheme] = useState(() => {
    const initialTheme = userTheme || 'system';
    const resolved = applyTheme(initialTheme);
    return initialTheme;
  });
  
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const initialTheme = userTheme || 'system';
    return initialTheme === 'system' ? getSystemTheme() : initialTheme;
  });

  // Initialize theme from user preferences or default
  useEffect(() => {
    const initialTheme = userTheme || 'system';
    const resolved = applyTheme(initialTheme);
    setTheme(initialTheme);
    setResolvedTheme(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTheme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme('system');
    };

    // Apply initial system theme
    applyTheme('system');

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Update theme function
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    const resolved = applyTheme(newTheme);
    setResolvedTheme(resolved);
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme: updateTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

