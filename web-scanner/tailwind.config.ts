import type { Config } from "tailwindcss";

const config: {
  plugins: any[];
  theme: { extend: { boxShadow: { glow: string }; borderRadius: { md: string; sm: string; lg: string } } };
  darkMode: string;
  content: string[]
} = {
  darkMode: "class", // <-- Gebruik een string ipv array
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 15px rgba(34,197,94,0.5)",
      },
      // eventueel meer properties...
    },
  },
  plugins: [],
};

export default config;
