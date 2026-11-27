export const mountDeck = (tracks = {}, audio = new Audio()) => {
  const tray = document.getElementById("disc-tray");
  const side = document.getElementById("record-side");
  const controls = document.getElementById("deck-controls");
  const play = document.getElementById("deck-play");
  const mute = document.getElementById("deck-mute");
  const range = document.getElementById("deck-position");
  const status = document.getElementById("deck-status");
  audio.preload = "none";
  controls.hidden = Object.keys(tracks).length === 0;

  let source;
  let title;
  let selectedNumber;
  let enabled = false;
  let intro = false;
  let bookOpen = false;
  let openedWithGesture = false;
  let playing = false;
  let attempt = 0;

  const render = () => {
    const hasDuration = !intro && Number.isFinite(audio.duration) && audio.duration > 0;
    const progress = hasDuration ? Math.min(1, audio.currentTime / audio.duration) : 0;
    range.disabled = !hasDuration || !audio.seekable.length || audio.seekable.end(audio.seekable.length - 1) === 0;
    range.value = String(Math.round(progress * 1000));
    range.setAttribute("aria-valuetext", `${Math.round(progress * 100)} % de la canción`);
    tray.toggleAttribute("data-playing", playing);
    mute.setAttribute("aria-pressed", String(audio.muted));
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

  const loadSelected = () => {
    pause();
    if (bookOpen && source) audio.src = source;
    else audio.removeAttribute("src");
    audio.load();
    status.textContent = source ? title : "Esta pista está disponible mediante el enlace a Spotify.";
    render();
    if (bookOpen && enabled && source) void start();
  };

  const select = (chapter, number) => {
    side.textContent = chapter.side;
    title = chapter.title;
    selectedNumber = number;
    source = tracks[selectedNumber];
    if (!controls.hidden && !intro && bookOpen) loadSelected();
  };

  const updateTracks = () => {
    controls.hidden = Object.keys(tracks).length === 0;
    source = tracks[selectedNumber];
    if (!controls.hidden && !intro && bookOpen) loadSelected();
  };

  const setBookOpen = (value, { byGesture = false } = {}) => {
    if (bookOpen === value) return;
    bookOpen = value;
    if (bookOpen && byGesture && !openedWithGesture) {
      openedWithGesture = true;
      enabled = true;
    }
    if (!intro && !controls.hidden) loadSelected();
  };

  const beginIntro = () => {
    intro = true;
    enabled = true;
    audio.muted = false;
    pause();
  };

  const endIntro = ({ withSound = true } = {}) => {
    intro = false;
    enabled = withSound;
    loadSelected();
  };

  const disable = () => {
    enabled = false;
    pause();
    status.textContent = "Música desactivada.";
  };

  audio.addEventListener("playing", () => {
    if (intro) return;
    playing = true;
    status.textContent = `Sonando · ${title}`;
    render();
  });
  for (const event of ["pause", "waiting", "ended", "emptied", "error"]) {
    audio.addEventListener(event, () => {
      if (intro) return;
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
    render();
  });
  range.addEventListener("input", () => {
    audio.currentTime = Number(range.value) * audio.duration / 1000;
    render();
  });

  return { select, setBookOpen, beginIntro, endIntro, disable, updateTracks };
};
