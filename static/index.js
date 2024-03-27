import { fileDisplay } from "/utils/fileDisplay.js";
const popup = document.querySelector(".popup-container");
const button = document.querySelector(".button.authorized");
const form = document.querySelector(".form");
let footerHeight = document
  .querySelector("footer")
  .getBoundingClientRect().height;

document.body.style.setProperty("--footerHeight", `${footerHeight}px`);

const URL_PARAMS = new URLSearchParams(window.location.search);
const TOKEN = URL_PARAMS.get("token");

const show = (selector) => {
  document.querySelector(selector).style.display = "block";
};

// Hide an element
const hide = (selector) => {
  document.querySelector(selector).style.display = "none";
};

if (TOKEN && TOKEN !== "undefined") {
  hide(".button.unauthorized");
  show(".button.authorized");
  popup.classList.add("authorized");

  // Hide the popup after 1 second
  setTimeout(() => {
    popup.classList.remove("authorized");
  }, 2800);
}

button.addEventListener("click", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const gitRepoUrl = formData.get("gitRepoUrl");
  if (!gitRepoUrl) {
    document.querySelector(".alert-container").style.display = "block";
    return;
  }
  console.log(gitRepoUrl, "git repository inputed");
  await fileDisplay(gitRepoUrl);
});
