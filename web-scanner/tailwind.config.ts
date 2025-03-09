import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4ade80",
                background: "#111827",
                card: "#1f2937",
                border: "#374151",
                text: "#f9fafb",
            },
            borderRadius: {
                DEFAULT: "8px",
            },
            boxShadow: {
                card: "0 4px 12px rgba(0, 0, 0, 0.3)",
            },
        },
    },
    plugins: [],
};

export default config;
