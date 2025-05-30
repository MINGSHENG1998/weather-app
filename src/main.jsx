import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n/index";
import "./styles/index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/theme-context.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
