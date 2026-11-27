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

const createChapter = (chapter, index, tracks) => {
  const number = index + 1;
  const article = createElement("article", "chapter-card");
  article.id = `capitulo-${number}`;
  article.dataset.chapter = String(number);
  article.setAttribute("aria-labelledby", `chapter-title-${number}`);
  article.hidden = number !== 1;

  const art = createElement("div", "chapter-art");
  art.dataset.side = chapter.side.slice(-1);
  if (number === 8) {
    const image = document.createElement("img");
    image.src = "./assets/bogota.jpg";
    image.alt = "El centro de Bogotá de noche, bajo la lluvia";
    image.loading = "lazy";
    art.append(image);
  }
  const cut = createElement("span", "chapter-art__caption", `${art.dataset.side}${(index % 4) + 1}`);
  cut.setAttribute("aria-hidden", "true");
  art.append(cut);

  const story = createElement("div", "chapter-story");
  story.append(createElement("p", "chapter-label", chapter.chapter));

  const title = createElement("h3", "chapter-title", chapter.title);
  title.id = `chapter-title-${number}`;
  title.tabIndex = -1;
  story.append(title);
  story.append(createElement("p", "chapter-artist", chapter.artist));
  story.append(createElement("p", "chapter-copy", chapter.story));
  if (!tracks[number]) story.append(createSpotifyLink(chapter));

  article.append(art, story);
  return article;
};

const createIndexLink = (chapter, index) => {
  const number = index + 1;
  const link = createElement("a", "chapter-index__link");
  link.href = `#capitulo-${number}`;
  link.setAttribute("aria-label", `Capítulo ${number}: ${chapter.title}, ${chapter.chapter}`);
  if (index === 0) link.setAttribute("aria-current", "step");

  const cut = `${chapter.side.slice(-1)}${(index % 4) + 1}`;
  link.append(createElement("span", "chapter-index__number", cut));
  link.append(createElement("span", "chapter-index__title", chapter.title));
  return link;
};

export const mountAlbum = ({ onChapter, onOpen, tracks = {} }) => {
  const cover = document.getElementById("portada");
  const album = document.getElementById("historia");
  const back = document.getElementById("celebracion");
  const coverLink = cover?.querySelector(".cover__entry");
  const stage = cover?.closest(".record-edition");
  const albumTitle = document.getElementById("album-title");
  const backTitle = document.getElementById("celebration-title");
  const index = document.getElementById("chapter-index");
  const container = document.getElementById("chapters");
  const status = document.getElementById("chapter-status");
  const previous = document.getElementById("chapter-previous");
  const next = document.getElementById("chapter-next");
  const turn = document.getElementById("chapter-back-cover");

  if (!coverLink || !stage || !album || !albumTitle || !back || !backTitle ||
      !index || !container || !status || !previous || !next || !turn) return;

  const links = chapters.map(createIndexLink);
  const cards = chapters.map((chapter, cardIndex) => createChapter(chapter, cardIndex, tracks));
  index.append(...links);
  container.append(...cards);

  let activeIndex = -1;
  let view = null;
  const panels = { cover, album, back };
  const entryPoints = { cover: coverLink, album: albumTitle, back: backTitle };

  const show = (nextView, { focus = false, byGesture = false } = {}) => {
    if (nextView !== view) {
      view = nextView;
      for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== view;
      coverLink.setAttribute("aria-expanded", String(view === "album"));
      album.classList.toggle("is-unfolding", view === "album" && focus);
      back.classList.toggle("is-turning", view === "back" && focus);
      onOpen(view === "album", { byGesture });
    }
    if (focus) {
      entryPoints[view].focus({ preventScroll: true });
      stage.scrollIntoView({ block: "start", behavior: "instant" });
    }
  };

  album.querySelector(".album-flap").addEventListener("animationend", () => {
    album.classList.remove("is-unfolding");
  });

  const activate = (requestedIndex, { updateHash = false, animate = true } = {}) => {
    const nextIndex = Math.max(0, Math.min(chapters.length - 1, requestedIndex));
    if (nextIndex === activeIndex) return;
    const backwards = nextIndex < activeIndex;
    activeIndex = nextIndex;

    cards.forEach((card, cardIndex) => {
      card.hidden = cardIndex !== activeIndex;
      card.classList.remove("is-entering", "is-entering-back");
    });

    const activeCard = cards[activeIndex];
    if (animate) {
      activeCard.classList.add("is-entering");
      activeCard.classList.toggle("is-entering-back", backwards);
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
    status.textContent = `${chapter.side} · página ${label} de ${String(chapters.length).padStart(2, "0")}`;

    previous.href = `#capitulo-${Math.max(1, activeIndex)}`;
    previous.hidden = activeIndex === 0;
    next.href = `#capitulo-${Math.min(chapters.length, activeIndex + 2)}`;
    next.hidden = activeIndex === chapters.length - 1;
    turn.hidden = !next.hidden;

    if (updateHash) history.pushState(null, "", `#capitulo-${activeIndex + 1}`);
    onChapter(chapter, activeIndex + 1);
  };

  const navigateFromLink = (event) => {
    const link = event.target.closest('a[href^="#capitulo-"]');
    if (!link || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

    const requestedIndex = Number(link.getAttribute("href").slice("#capitulo-".length)) - 1;
    if (!Number.isInteger(requestedIndex) || requestedIndex < 0 || requestedIndex >= chapters.length) return;
    event.preventDefault();
    activate(requestedIndex, { updateHash: true });
    cards[activeIndex].querySelector("h3").focus({ preventScroll: true });
    status.scrollIntoView({ block: index.contains(link) ? "start" : "nearest" });
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

  const openHash = () => {
    const hash = location.hash;
    const match = hash.match(/^#capitulo-(\d+)$/);
    const requestedIndex = Number(match?.[1]) - 1;
    if (Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < chapters.length) {
      activate(requestedIndex, { animate: false });
      show("album");
    } else if (hash === "#historia") {
      const savedPage = history.state?.albumPage;
      activate(Number.isInteger(savedPage) ? savedPage : 0, { animate: false });
      show("album");
    } else if (["#celebracion", "#asistencia", "#regalos"].includes(hash)) {
      show("back");
    } else if (!hash || hash === "#portada" || view === null) {
      show("cover");
    }
  };

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = event.target.closest('a[href="#historia"], a[href="#portada"], a[href="#celebracion"]');
    if (!link) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState({ albumPage: activeIndex }, "", link.hash);
    const destination = { "#historia": "album", "#portada": "cover", "#celebracion": "back" }[link.hash];
    show(destination, { focus: true, byGesture: true });
  });

  activate(0, { animate: false });
  openHash();
  if (view !== "cover") requestAnimationFrame(() => {
    const target = back.querySelector(location.hash === "#regalos" ? "#regalos" : "#asistencia");
    const scrollTarget = ["#regalos", "#asistencia"].includes(location.hash) ? target : stage;
    scrollTarget.scrollIntoView({ block: "start", behavior: "instant" });
  });
  window.addEventListener("hashchange", openHash);
};
