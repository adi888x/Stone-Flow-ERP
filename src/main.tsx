import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);

// Hide the initial HTML loader once React has mounted
requestAnimationFrame(() => {
  const loader = document.getElementById("app-loader");
  if (loader) {
    loader.classList.add("hidden");
    // Remove from DOM after fade-out transition
    setTimeout(() => loader.remove(), 500);
  }
});
