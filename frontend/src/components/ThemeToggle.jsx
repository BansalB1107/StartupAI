import { useContext } from "react";
import ThemeContext from "../theme/ThemeContext";

// Renders a persistent floating action button to dynamically toggle between light and dark UI themes.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        fontSize: "20px",
        background: "var(--surface)",
        color: "var(--text)",
        boxShadow: "0 4px 15px var(--shadow)",
        zIndex: 9999,
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}