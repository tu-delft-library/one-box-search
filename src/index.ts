import { createResults } from "./functions";

window.onload = () => {
  const { value } = document.querySelector(
    ".searchForm-input"
  ) as HTMLInputElement;
  createResults(value);
};
