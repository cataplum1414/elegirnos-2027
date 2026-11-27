import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";

mountAlbum();
mountReadingProgress();

const recordLink = document.querySelector(".record-link");
if (recordLink) {
  recordLink.addEventListener("click", () => {
    recordLink.classList.remove("is-turning");
    void recordLink.offsetWidth;
    recordLink.classList.add("is-turning");
    window.setTimeout(() => recordLink.classList.remove("is-turning"), 1200);
  });
}
