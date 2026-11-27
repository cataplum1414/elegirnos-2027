export const mountDeck = (tracks = {}) => {
  const table = document.getElementById("turntable");
  const side = document.getElementById("record-side");
  const controls = document.getElementById("deck-controls");
  const play = document.getElementById("deck-play");
  const mute = document.getElementById("deck-mute");
  const range = document.getElementById("deck-position");
  const status = document.getElementById("deck-status");
  const audio = new Audio();
  audio.preload = "none";
  controls.hidden = Object.keys(tracks).length === 0;

  let source;
  let title;
  let enabled = false;
  let playing = false;
  let attempt = 0;

  const render = () => {
    const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
    const progress = hasDuration ? Math.min(1, audio.currentTime / audio.duration) : 0;
    range.disabled = !hasDuration || !audio.seekable.length || audio.seekable.end(audio.seekable.length - 1) === 0;
    range.value = String(Math.round(progress * 1000));
    range.setAttribute("aria-valuetext", `${Math.round(progress * 100)} % de la canción`);
    table.style.setProperty("--tracking", `${progress * 30}deg`);
    table.toggleAttribute("data-playing", playing);
    table.toggleAttribute("data-cued", playing || (Boolean(source) && audio.currentTime > 0 && !audio.ended));
    play.textContent = !enabled ? "Activar música" : !source ? "Desactivar música" : playing ? "Pausar" : "Reproducir";
  };

  const start = async () => {
    const pending = ++attempt;
    status.textContent = "";
    try {
      await audio.play();
    } catch {
      if (pending !== attempt) return;
      status.textContent = "Toca Reproducir para intentar de nuevo.";
      render();
    }
  };

  const pause = () => {
    attempt++;
    audio.pause();
    playing = false;
    render();
  };

  const select = (chapter, number) => {
    side.textContent = chapter.side;
    if (controls.hidden) return;
    pause();
    title = chapter.title;
    source = tracks[number];
    if (source) audio.src = source;
    else audio.removeAttribute("src");
    audio.load();
    status.textContent = source ? title : "Esta pista está disponible mediante el enlace a Spotify.";
    render();
    if (enabled && source) void start();
  };

  audio.addEventListener("playing", () => {
    playing = true;
    status.textContent = `Sonando · ${title}`;
    render();
  });
  for (const event of ["pause", "waiting", "ended", "emptied", "error"]) {
    audio.addEventListener(event, () => {
      if (event === "pause" && !audio.paused) return;
      playing = false;
      if (event === "ended") status.textContent = `Terminó · ${title}`;
      if (event === "error" && source) status.textContent = "El navegador no pudo leer esta pista.";
      render();
    });
  }
  audio.addEventListener("timeupdate", render);
  audio.addEventListener("durationchange", render);
  audio.addEventListener("progress", render);

  play.addEventListener("click", () => {
    if (!source) {
      enabled = !enabled;
      status.textContent = enabled
        ? "La música sonará al abrir una página que tenga audio."
        : "Música desactivada.";
      render();
      return;
    }
    if (!audio.paused) {
      pause();
      status.textContent = "En pausa";
      return;
    }
    enabled = true;
    render();
    void start();
  });
  mute.addEventListener("click", () => {
    audio.muted = !audio.muted;
    mute.setAttribute("aria-pressed", String(audio.muted));
  });
  range.addEventListener("input", () => {
    audio.currentTime = Number(range.value) * audio.duration / 1000;
    render();
  });

  return { select, pause };
};
