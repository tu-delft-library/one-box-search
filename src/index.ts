import { createResults } from "./functions";

window.onload = () => {
  const { value } = document.querySelector(
    ".searchForm-input"
  ) as HTMLInputElement;
  const language = document.documentElement.lang || "en";
  // Enable smooth scrolling
  document.documentElement.style.setProperty("scroll-behavior", "smooth");
  createResults(value, language);
};
