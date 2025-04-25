import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";

// Log environment variables
// console.log("API URL:", import.meta.env.VITE_API_URL);
// console.log("Socket URL:", import.meta.env.VITE_SOCKET_URL);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
