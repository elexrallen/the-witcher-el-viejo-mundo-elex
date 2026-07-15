import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./pwa";
import "./index.css";

if (window.matchMedia("(pointer: coarse)").matches) {
  document.documentElement.classList.add("is-touch");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
