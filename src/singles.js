const clock = seconds => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

// Reproductores sueltos (portada y contraportada). Cada uno suena solo cuando
// la persona pulsa Reproducir, comparte un único elemento de audio y cede el
// turno a la música del cancionero y a las demás pistas.
export const mountSingles = ({ audio: albumAudio } = {}) => {
  const singles = [...document.querySelectorAll("[data-single]")];
  if (!singles.length) return;

  const player = new Audio();
  player.preload = "none";
  let active = null;

  const parts = new Map(singles.map(single => [single, {
    play: single.querySelector("[data-single-play]"),
    seek: single.querySelector("[data-single-seek]"),
    time: single.querySelector("[data-single-time]"),
    status: single.querySelector("[data-single-status]"),
    title: single.querySelector(".single__title").textContent.trim(),
    duration: Number(single.dataset.duration) || 0
  }]));

  const render = () => {
    for (const [single, ui] of parts) {
      const current = single === active;
      const playing = current && !player.paused && !player.ended;
      const duration = current && Number.isFinite(player.duration) && player.duration > 0 ? player.duration : ui.duration;
      const position = current ? player.currentTime : 0;

      single.toggleAttribute("data-playing", playing);
      ui.play.setAttribute("aria-pressed", String(playing));
      ui.play.setAttribute("aria-label", `${playing ? "Pausar" : "Reproducir"} ${ui.title}`);
      ui.time.textContent = `${clock(position)} / ${clock(duration)}`;

      const seekable = current && player.seekable.length > 0 && Number.isFinite(player.duration) && player.duration > 0;
      ui.seek.disabled = !seekable;
      ui.seek.value = String(seekable ? Math.round(Math.min(1, position / player.duration) * 1000) : 0);
      ui.seek.setAttribute("aria-valuetext", `${clock(position)} de ${clock(duration)}`);
    }
  };

  const toggle = async single => {
    const ui = parts.get(single);
    if (active === single && !player.paused) {
      player.pause();
      return;
    }
    if (active !== single) {
      if (active) parts.get(active).status.textContent = "";
      active = single;
      player.src = new URL(single.dataset.src, document.baseURI).href;
    }
    // Un solo sonido a la vez: el cancionero y la escena de apertura se silencian.
    albumAudio?.pause();
    ui.status.textContent = "";
    try {
      await player.play();
    } catch {
      if (active === single) ui.status.textContent = "No pudimos reproducir la canción. Inténtalo de nuevo.";
    }
    render();
  };

  for (const [single, ui] of parts) {
    single.hidden = false;
    ui.play.addEventListener("click", () => void toggle(single));
    ui.seek.addEventListener("input", () => {
      if (active !== single || !Number.isFinite(player.duration)) return;
      player.currentTime = Number(ui.seek.value) * player.duration / 1000;
      render();
    });

    // Al salir de la portada o de la contraportada la canción se detiene.
    const scope = single.closest("section");
    if (scope) {
      new MutationObserver(() => {
        if (scope.hidden && active === single) player.pause();
      }).observe(scope, { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  for (const event of ["play", "pause", "ended", "timeupdate", "durationchange", "loadedmetadata", "progress", "emptied"]) {
    player.addEventListener(event, render);
  }
  player.addEventListener("error", () => {
    if (!active) return;
    parts.get(active).status.textContent = "El navegador no pudo leer esta canción.";
    render();
  });
  albumAudio?.addEventListener("playing", () => {
    if (!player.paused) player.pause();
  });

  render();
};
