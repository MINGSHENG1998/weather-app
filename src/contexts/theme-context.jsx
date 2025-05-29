import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
});

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const updateTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    updateTheme(newTheme);

    try {
      localStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.warn("Failed to save theme:", error);
    }
  };

  useEffect(() => {
    updateTheme(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
