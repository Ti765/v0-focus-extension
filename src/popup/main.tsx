// Initialize Sentry monitoring FIRST
import { Sentry } from "../lib/sentry-popup";

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ErrorFallback } from "./components/ErrorFallback"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog={false}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
