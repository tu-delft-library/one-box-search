import { searchIn4tu } from "./src/functions";

window.onload = () => {
  const { value } = document.getElementsByClassName(
    "searchForm-input"
  )[0] as HTMLInputElement;
  if (value) {
    searchIn4tu(value);
  }
};
