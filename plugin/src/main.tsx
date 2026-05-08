import "framer-plugin/framer.css"
import "./styles/reset.css"
import "./styles/global.css"

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

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[Stream Bunny plugin]", error, info.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return (
                <main role="alert" aria-live="assertive" className="errorBoundary">
                    <strong>Plugin error:</strong> {this.state.error?.message}
                </main>
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
