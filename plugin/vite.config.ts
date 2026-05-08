import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import mkcert from "vite-plugin-mkcert"
import framer from "vite-plugin-framer"

export default defineConfig({
    plugins: [react(), mkcert(), framer()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    css: {
        modules: {
            localsConvention: "camelCaseOnly",
            generateScopedName: "[name]__[local]__[hash:base64:5]",
        },
    },
    /** Framer expects a stable dev URL; strictPort surfaces conflicts instead of silently switching ports. */
    server: {
        port: 5173,
        strictPort: true,
        host: true,
    },
    build: {
        target: "ES2022",
    },
})
