// La contraportada se lee como un libreto de cuatro páginas, de lo más
// importante (fecha y lugar) a lo más accesorio (backstage). Sin JavaScript
// todas las páginas quedan visibles una debajo de otra.
export const mountBackCover = () => {
  const back = document.getElementById("celebracion");
  const book = back?.querySelector("[data-pages]");
  if (!back || !book) return;

  const pages = [...book.querySelectorAll("[data-page]")];
  const tabs = [...book.querySelectorAll("[data-page-link]")];
  const status = book.querySelector("[data-page-status]");
  const previous = book.querySelector("[data-page-previous]");
  const next = book.querySelector("[data-page-next]");
  const end = book.querySelector("[data-page-end]");
  if (!pages.length || tabs.length !== pages.length || !status || !previous || !next || !end) return;

  const hashes = pages.map(page => page.dataset.hashes.split(" "));
  const canonical = hashes.map(list => list[0]);
  const titles = tabs.map(tab => tab.lastElementChild.textContent.trim());
  const routeFor = hash => Math.max(0, hashes.findIndex(list => list.includes(hash)));

  let current = -1;

  const show = (index, { focus = false, push = false } = {}) => {
    const target = Math.max(0, Math.min(pages.length - 1, index));
    const changed = target !== current;
    current = target;

    pages.forEach((page, pageIndex) => { page.hidden = pageIndex !== current; });
    tabs.forEach((tab, tabIndex) => {
      if (tabIndex === current) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });

    status.textContent = `Página ${current + 1} de ${pages.length} · ${titles[current]}`;
    previous.hidden = current === 0;
    next.hidden = current === pages.length - 1;
    end.hidden = !next.hidden;
    if (current > 0) previous.href = canonical[current - 1];
    if (current < pages.length - 1) next.href = canonical[current + 1];

    if (push && changed && location.hash !== canonical[current]) {
      history.pushState(history.state, "", canonical[current]);
    }
    if (focus && changed) {
      pages[current].querySelector("h3")?.focus({ preventScroll: true });
      if (book.getBoundingClientRect().top < 0) book.scrollIntoView({ block: "start", behavior: "instant" });
    }
  };

  const go = index => event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    show(typeof index === "function" ? index() : index, { focus: true, push: true });
  };

  tabs.forEach((tab, index) => tab.addEventListener("click", go(index)));
  previous.addEventListener("click", go(() => current - 1));
  next.addEventListener("click", go(() => current + 1));

  book.classList.add("is-paged");
  show(routeFor(location.hash));

  // Atrás/adelante del navegador y enlaces directos a #asistencia, #regalos, etc.
  window.addEventListener("hashchange", () => {
    if (!back.hidden) show(routeFor(location.hash));
  });
  // Al dar la vuelta al disco se empieza por la primera página (o la que pida el enlace).
  new MutationObserver(() => {
    if (!back.hidden) show(routeFor(location.hash));
  }).observe(back, { attributes: true, attributeFilter: ["hidden"] });
};
