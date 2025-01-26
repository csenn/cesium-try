import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
import AppTwo from "./AppTwo.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppTwo />
  </StrictMode>,
);
