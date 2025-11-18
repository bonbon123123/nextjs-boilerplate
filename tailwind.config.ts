import type { Config } from "tailwindcss";
// @ts-ignore
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {},
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        main: "rgba(119, 51, 68, 1)",
        "light-main": "rgba(171, 73, 98, 1)",
        secondary: "rgba(230, 119, 55, 1)",
        "light-secondary": "rgba(235, 144, 92, 1)",
        light: "rgba(195, 223, 224, 1)",
        dark: "rgba(2, 24, 43, 1)",
        black: "rgba(0, 0, 0, 1)",
        white: "rgba(255, 255, 255, 1)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "color-scheme": "light",
          primary: "oklch(60% 0.118 184.704)",
          "primary-content": "oklch(98% 0.014 180.72)",
          secondary: "oklch(66% 0.179 58.318)",
          "secondary-content": "oklch(98% 0.022 95.277)",
          accent: "oklch(60% 0.118 184.704)",
          "accent-content": "oklch(98% 0.014 180.72)",
          neutral: "oklch(26% 0 0)",
          "neutral-content": "oklch(98% 0 0)",
          "base-100": "oklch(100% 0 0)",
          "base-200": "oklch(95% 0 0)",
          "base-300": "oklch(90% 0 0)",
          "base-content": "oklch(14% 0 0)",
          info: "oklch(68% 0.169 237.323)",
          "info-content": "oklch(97% 0.013 236.62)",
          success: "oklch(70% 0.14 182.503)",
          "success-content": "oklch(98% 0.014 180.72)",
          warning: "oklch(70% 0.213 47.604)",
          "warning-content": "oklch(98% 0.016 73.684)",
          error: "oklch(65% 0.241 354.308)",
          "error-content": "oklch(97% 0.014 343.198)",
        },
        dark: {
          "color-scheme": "dark",
          primary: "oklch(60% 0.118 184.704)",
          "primary-content": "oklch(98% 0.014 180.72)",
          secondary: "oklch(66% 0.179 58.318)",
          "secondary-content": "oklch(98% 0.022 95.277)",
          accent: "oklch(60% 0.118 184.704)",
          "accent-content": "oklch(98% 0.014 180.72)",
          neutral: "oklch(26% 0 0)",
          "neutral-content": "oklch(98% 0 0)",
          "base-100": "oklch(14% 0 0)",
          "base-200": "oklch(20% 0 0)",
          "base-300": "oklch(26% 0 0)",
          "base-content": "oklch(97% 0 0)",
          info: "oklch(68% 0.169 237.323)",
          "info-content": "oklch(97% 0.013 236.62)",
          success: "oklch(70% 0.14 182.503)",
          "success-content": "oklch(98% 0.014 180.72)",
          warning: "oklch(70% 0.213 47.604)",
          "warning-content": "oklch(98% 0.016 73.684)",
          error: "oklch(65% 0.241 354.308)",
          "error-content": "oklch(97% 0.014 343.198)",
        },
      },
    ],
  },
};

export default config;
