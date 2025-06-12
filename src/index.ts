import { createResults } from "./functions";

window.onload = () => {
  const { value } = document.querySelector(
    ".searchForm-input"
  ) as HTMLInputElement;
  const language = document.documentElement.lang || "en";
  createResults(value, language);
};
