import "framer-plugin/framer.css"
import "./index.css"

import React, { Component, type ReactNode } from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App.tsx"

class ErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean; error?: Error }
> {
    state = { hasError: false, error: undefined as Error | undefined }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 16, background: "#0d0d0d", color: "#fff", fontSize: 13 }}>
                    <strong>Plugin error:</strong> {this.state.error?.message}
                </div>
            )
        }
        return this.props.children
    }
}

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
)
