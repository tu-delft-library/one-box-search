import { createResults } from "./functions";

window.onload = () => {
  let value: string = "";
  const searchElement = document.querySelector(
    ".searchForm-input"
  ) as HTMLInputElement;
  value = searchElement.value;
  // Fix for dev page where the value disappears
  // if (!value) {
  //   const params = new URLSearchParams(window.location.search);
  //   value = params.get("q") || "";
  // }
  const language = document.documentElement.lang || "en";
  // Enable smooth scrolling
  document.documentElement.style.setProperty("scroll-behavior", "smooth");
  createResults(value, language);
};
