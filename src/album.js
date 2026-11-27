import { chapters } from "./data/chapters.js";

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

const createSpotifyLink = ({ title, artist }) => {
  const query = encodeURIComponent(`${title} ${artist}`);
  const link = createElement("a", "spotify-link");
  link.href = `https://open.spotify.com/search/${query}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `Buscar “${title}” de ${artist} en Spotify; se abre en otra pestaña`);
  link.append("Buscar en Spotify ");

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M3 13 13 3M5 3h8v8");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.3");
  icon.append(path);
  link.append(icon);
  return link;
};

const createChapter = (chapter, index) => {
  const number = index + 1;
  const article = createElement("article", "chapter-card");
  article.id = `capitulo-${number}`;
  article.dataset.chapter = String(number);
  article.setAttribute("aria-labelledby", `chapter-title-${number}`);
  article.hidden = number !== 1;

  const art = createElement("div", "chapter-art");
  art.dataset.chapter = String(number);
  art.setAttribute("aria-hidden", "true");
  art.append(createElement("span", "chapter-art__caption", `${chapter.side} · corte ${String(number).padStart(2, "0")}`));

  const story = createElement("div", "chapter-story");
  story.append(createElement("p", "chapter-label", chapter.chapter));

  const title = createElement("h3", "chapter-title", chapter.title);
  title.id = `chapter-title-${number}`;
  story.append(title);
  story.append(createElement("p", "chapter-artist", chapter.artist));
  story.append(createElement("p", "chapter-copy", chapter.story));
  story.append(createSpotifyLink(chapter));

  article.append(art, story);
  return article;
};

const createIndexLink = (chapter, index) => {
  const number = index + 1;
  const link = createElement("a", "chapter-index__link");
  link.href = `#capitulo-${number}`;
  link.setAttribute("aria-label", `Capítulo ${number}: ${chapter.title}, ${chapter.chapter}`);
  if (index === 0) link.setAttribute("aria-current", "step");

  link.append(createElement("span", "chapter-index__number", String(number).padStart(2, "0")));
  link.append(createElement("span", "chapter-index__title", chapter.title));
  return link;
};

export const mountAlbum = () => {
  const index = document.getElementById("chapter-index");
  const container = document.getElementById("chapters");
  const status = document.getElementById("chapter-status");
  const previous = document.getElementById("chapter-previous");
  const next = document.getElementById("chapter-next");

  if (!index || !container || !status || !previous || !next) return;

  const links = chapters.map(createIndexLink);
  const cards = chapters.map(createChapter);
  index.append(...links);
  container.append(...cards);

  let activeIndex = 0;

  const activate = (requestedIndex, { updateHash = false, animate = true } = {}) => {
    const nextIndex = Math.max(0, Math.min(chapters.length - 1, requestedIndex));
    activeIndex = nextIndex;

    cards.forEach((card, cardIndex) => {
      card.hidden = cardIndex !== activeIndex;
      card.classList.remove("is-entering");
    });

    const activeCard = cards[activeIndex];
    if (animate) {
      void activeCard.offsetWidth;
      activeCard.classList.add("is-entering");
    }

    links.forEach((link, linkIndex) => {
      if (linkIndex === activeIndex) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const chapter = chapters[activeIndex];
    const label = String(activeIndex + 1).padStart(2, "0");
    status.textContent = `${chapter.side} · capítulo ${label} de ${String(chapters.length).padStart(2, "0")}`;

    previous.href = `#capitulo-${Math.max(1, activeIndex)}`;
    previous.hidden = activeIndex === 0;
    next.href = `#capitulo-${Math.min(chapters.length, activeIndex + 2)}`;
    next.hidden = activeIndex === chapters.length - 1;

    if (updateHash) history.replaceState(null, "", `#capitulo-${activeIndex + 1}`);
  };

  const navigateFromLink = (event) => {
    const link = event.target.closest('a[href^="#capitulo-"]');
    if (!link) return;

    const requestedIndex = Number(link.getAttribute("href").slice("#capitulo-".length)) - 1;
    if (!Number.isInteger(requestedIndex) || requestedIndex < 0 || requestedIndex >= chapters.length) return;
    event.preventDefault();
    activate(requestedIndex, { updateHash: true });
  };

  index.addEventListener("click", navigateFromLink);
  previous.addEventListener("click", navigateFromLink);
  next.addEventListener("click", navigateFromLink);

  index.addEventListener("keydown", (event) => {
    const current = links.indexOf(document.activeElement);
    if (current < 0) return;

    let destination = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") destination = Math.min(links.length - 1, current + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") destination = Math.max(0, current - 1);
    if (event.key === "Home") destination = 0;
    if (event.key === "End") destination = links.length - 1;
    if (destination === null) return;

    event.preventDefault();
    activate(destination, { updateHash: true });
    links[destination].focus();
  });

  const initialChapter = window.location.hash.match(/^#capitulo-(\d+)$/);
  if (initialChapter) {
    const requestedIndex = Number(initialChapter[1]) - 1;
    if (requestedIndex >= 0 && requestedIndex < chapters.length) {
      activate(requestedIndex, { animate: false });
      requestAnimationFrame(() => cards[requestedIndex].scrollIntoView({ block: "center" }));
      return;
    }
  }

  activate(0, { animate: false });
};
