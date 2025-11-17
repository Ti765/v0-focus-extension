// Initialize Sentry monitoring FIRST
import { Sentry } from "../lib/sentry-options";

import React from "react"
import ReactDOM from "react-dom/client"
import OptionsApp from "./OptionsApp"
import { ErrorFallback } from "./components/ErrorFallback"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={(props) => <ErrorFallback {...props} />} showDialog={false}>
      <OptionsApp />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
