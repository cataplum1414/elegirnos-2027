export const mountEnvelope = cover => {
  const disc = cover.querySelector(".cover__object");
  const title = cover.querySelector(".cover__title");
  const envelope = document.createElement("section");
  envelope.className = "invitation-envelope";
  envelope.setAttribute("aria-label", "Sobre de la invitación");
  envelope.hidden = true;
  envelope.innerHTML = `
    <div class="invitation-envelope__parcel">
      <div class="invitation-envelope__back" aria-hidden="true"></div>
      <div class="invitation-envelope__insert" aria-hidden="true"><div class="invitation-envelope__insert-title"></div></div>
      <div class="invitation-envelope__pocket" aria-hidden="true"></div>
      <div class="invitation-envelope__flap" aria-hidden="true">
        <p>Jeisson <span>&amp;</span> Ornella</p>
      </div>
      <div class="invitation-envelope__cord invitation-envelope__cord--top" aria-hidden="true"></div>
      <div class="invitation-envelope__cord invitation-envelope__cord--bottom" aria-hidden="true"></div>
      <button class="invitation-envelope__open" type="button" aria-label="Romper el sello y ver la portada">
        <span class="invitation-envelope__seal" aria-hidden="true">J&amp;O</span>
        <span class="invitation-envelope__wax invitation-envelope__wax--left" aria-hidden="true">J&amp;O</span>
        <span class="invitation-envelope__wax invitation-envelope__wax--right" aria-hidden="true">J&amp;O</span>
      </button>
    </div>
    <p class="invitation-envelope__hint" aria-hidden="true">Rompe el sello para abrir</p>`;
  envelope.querySelector(".invitation-envelope__insert-title")
    .append(...Array.from(title.childNodes, node => node.cloneNode(true)));
  cover.append(envelope);

  for (const file of ["sello-lacre.webp", "sobre-papel.webp"]) {
    const image = new Image();
    image.fetchPriority = "low";
    image.src = new URL(file, import.meta.url).href;
  }

  const seal = envelope.querySelector(".invitation-envelope__open");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let finishTimer;

  const finish = ({ focus = true } = {}) => {
    if (envelope.hidden) return;
    clearTimeout(finishTimer);
    envelope.hidden = true;
    delete cover.dataset.envelope;
    seal.removeAttribute("aria-disabled");
    disc.inert = false;
    if (focus && !cover.hidden) {
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
  };

  seal.addEventListener("click", () => {
    if (cover.dataset.envelope !== "sealed") return;
    if (reducedMotion.matches) {
      finish();
      return;
    }
    cover.dataset.envelope = "opening";
    seal.setAttribute("aria-disabled", "true");
    finishTimer = setTimeout(finish, 2160);
  });

  envelope.addEventListener("animationend", event => {
    if (event.target === envelope && event.animationName === "envelope-out") finish();
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches && cover.dataset.envelope === "opening") finish();
  });
  new MutationObserver(() => {
    if (cover.hidden) finish({ focus: false });
  }).observe(cover, { attributes: true, attributeFilter: ["hidden"] });

  return {
    present({ focus = false } = {}) {
      if (cover.hidden) return;
      if (envelope.hidden) {
        disc.inert = true;
        cover.dataset.envelope = "sealed";
        envelope.hidden = false;
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      if (focus) seal.focus({ preventScroll: true });
    }
  };
};
