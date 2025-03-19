import { createResults } from "./src/functions";

window.onload = () => {
  const { value } = document.getElementsByClassName(
    "searchForm-input"
  )[0] as HTMLInputElement;
  if (value) {
    createResults(value);
  }
};
