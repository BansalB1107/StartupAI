import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";
import "./theme.css";

// Manages global application theme state, applying light or dark modes and persisting user visual preferences.
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}