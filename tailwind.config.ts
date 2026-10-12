import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1b1f",
        paper: "#faf9f7",
        accent: "#2f5d50",
        accentSoft: "#e4efe9",
        warn: "#9a5b13",
      },
    },
  },
  plugins: [],
};
export default config;
