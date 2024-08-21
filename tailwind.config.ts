import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {

      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

      },
      colors: {
        'main': 'rgba(119, 51, 68, 1)',
        'light-main': 'rgba(171, 73, 98, 1)',
        'secondary': 'rgba(230, 119, 55, 1)',
        'light-secondary': 'rgba(235, 144, 92, 1)',
        'light': 'rgba(195, 223, 224, 1)',
        'dark': 'rgba(2, 24, 43, 1)',
        'black': 'rgba(0, 0, 0, 1)',
        'white': 'rgba(255, 255, 255, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
