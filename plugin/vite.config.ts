import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import mkcert from "vite-plugin-mkcert"
import framer from "vite-plugin-framer"
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), mkcert(), framer()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    server: { port: 5173 },
    build: {
        target: "ES2022",
    },
})
