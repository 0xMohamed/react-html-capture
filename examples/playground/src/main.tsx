import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const container = document.getElementById("root")!;
if (!(container as any)._reactRoot) {
  const root = ReactDOM.createRoot(container);
  (container as any)._reactRoot = root;
  root.render(<App />);
} else {
  (container as any)._reactRoot.render(<App />);
}
