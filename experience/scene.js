import { mountMotion } from "./scene-motion.js?v=20261128-2";
import { ceremony, fade, sceneAt, sceneStep } from "./scene-story.js?v=20261128-2";
import { mountEnvelope } from "./envelope.js";

const asset = file => new URL(file, import.meta.url).href;
const score = asset("musica-de-la-intro.m4a");
// Media time at the first full phrase of the instrumental envelope loop.
const ambienceStart = 76.8;
const storyRate = 0.80;
const art = {
  premiere: asset("intro-entradas-cine.webp"),
  corridor: asset("intro-corredor-nocturno.webp"),
  castle: asset("intro-castillo-cuento.webp"),
  ship: asset("intro-nave.webp"),
  guardian: asset("intro-guardian.webp"),
  gate: asset("intro-puerta.webp"),
  jeiClose: asset("intro-jeisson-primer-plano.webp"),
  setup: asset("intro-estuche-corazon.webp"),
  orneClose: asset("intro-ornella-rosa.webp"),
  keyClose: asset("intro-ornella-llave.webp"),
  jei: asset("jei-carrera-negro.webp"),
  orne: asset("orne-carrera-v2.webp"),
  proposal: asset("intro-pedida-cuento.webp"),
  ring: asset("anillo-estuche-corazon.webp"),
  letter: asset("intro-sobre-cuento.webp")
};

const stage = `
  <div class="chase__screen" aria-hidden="true">
    <img class="chase__scenery chase__scenery--space" src="${art.corridor}" alt="" fetchpriority="high">
    <img class="chase__scenery chase__scenery--castle" src="${art.castle}" alt="" fetchpriority="low">
    <div class="chase__light"></div>
    <div class="chase__transport">
      <img src="${art.ship}" alt="">
      <span class="chase__searchlight"></span>
    </div>
    <div class="chase__guardian">
      <img src="${art.guardian}" alt="">
      <span class="chase__socket"></span>
    </div>
    <span class="chase__key-flight"></span>
    <div class="chase__speed"></div>
    <div class="chase__dust"><i></i><i></i><i></i></div>
    <img class="chase__runner chase__runner--orne chase__idle" src="${art.orne}" alt="">
    <canvas class="chase__run-frame chase__run-frame--orne" width="640" height="544"></canvas>
    <img class="chase__runner chase__runner--jei chase__idle" src="${art.jei}" alt="">
    <canvas class="chase__run-frame chase__run-frame--jei" width="640" height="544"></canvas>
    <i class="chase__throw chase__throw--kiss" hidden><i></i></i>
    <i class="chase__throw chase__throw--kiss" hidden><i></i></i>
    <i class="chase__throw chase__throw--burst chase__throw--kiss" hidden><i></i></i>
    <p class="chase__comic" hidden></p>
    <img class="chase__cut-in chase__cut-in--jei" src="${art.jeiClose}" alt="">
    <img class="chase__cut-in chase__cut-in--premiere" src="${art.premiere}" alt="" fetchpriority="high">
    <div class="chase__setup">
      <div class="chase__setup-frame">
        <img src="${art.setup}" alt="">
        <span class="chase__fallen-key"></span>
      </div>
    </div>
    <div class="chase__gate">
      <img class="chase__door chase__door--left" src="${art.gate}" alt="" fetchpriority="low">
      <img class="chase__door chase__door--right" src="${art.gate}" alt="" fetchpriority="low">
    </div>
    <div class="chase__gate-light"></div>
    <img class="chase__cut-in chase__cut-in--key" src="${art.keyClose}" alt="" fetchpriority="low">
    <img class="chase__cut-in chase__cut-in--orne" src="${art.orneClose}" alt="" fetchpriority="low">
    <div class="chase__birds"><i></i><i></i><i></i></div>
    <div class="chase__stardust"><i></i><i></i><i></i><i></i><i></i></div>
    <img class="chase__cut-in chase__cut-in--proposal" src="${art.proposal}" alt="" fetchpriority="low">
    <div class="chase__ring-cut"><img src="${art.ring}" alt="" fetchpriority="low"></div>
    <img class="chase__cut-in chase__cut-in--letter" src="${art.letter}" alt="" fetchpriority="low">
  </div>`;

export const mount = ({ audio, deck }) => {
  const root = document.documentElement;
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = asset("scene.css?v=20261128-2");

  const dialog = document.createElement("dialog");
  dialog.className = "chase";
  dialog.setAttribute("aria-labelledby", "chase-title");
  dialog.innerHTML = `
    <div class="chase__content">
      <header class="chase__header">
        <p class="cover__edition">Invitación de boda</p>
        <h2 id="chase-title">Jeisson <span>&amp;</span> Ornella</h2>
      </header>
      ${stage}
      <div class="chase__caption-line"><p class="chase__subtitle" hidden></p></div>
      <footer class="chase__footer">
        <p class="chase__announcement" role="status"></p>
        <nav class="chase__navigation" aria-label="Recorrido de escenas">
          <button type="button" id="chase-previous"><span aria-hidden="true">←</span> Escena anterior</button>
          <button type="button" id="chase-next">Escena siguiente <span aria-hidden="true">→</span></button>
        </nav>
        <div class="chase__actions">
          <button type="button" id="chase-play" autofocus>Activar música</button>
          <button type="button" id="chase-pause">Pausar escena</button>
        </div>
      </footer>
    </div>`;
  document.body.append(dialog);

  const screen = dialog.querySelector(".chase__screen");
  const firstFrame = screen.querySelector(".chase__cut-in--premiere");
  const status = dialog.querySelector(".chase__announcement");
  const subtitle = dialog.querySelector(".chase__subtitle");
  const sound = dialog.querySelector("#chase-play");
  const pause = dialog.querySelector("#chase-pause");
  const previous = dialog.querySelector("#chase-previous");
  const next = dialog.querySelector("#chase-next");
  const startEntry = document.getElementById("opening-start");
  const silentEntry = document.getElementById("opening-silent");
  const entryStatus = document.getElementById("opening-status");
  const originalPreload = audio.preload;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const draw = mountMotion(screen, reducedMotion);
  let elapsed = 0;
  let lastTick = null;
  let frame = 0;
  let attempt = 0;
  let paused = false;
  let musicWanted = false;
  let heardMusic = false;
  let beat = "";
  let audioOffset = null;
  let entryActive = false;
  let frameReady = false;
  let entryAttempt = 0;
  let audioNotice;
  let holdingScore = false;
  const cover = document.getElementById("portada");
  const envelope = mountEnvelope(cover, {
    canPlaySound: () => musicWanted && heardMusic
  });

  const updateSound = () => {
    sound.textContent = musicWanted ? "Silenciar música" : "Activar música";
  };

  const stopMusic = () => {
    attempt++;
    audio.pause();
  };

  const startMusic = async () => {
    const pending = ++attempt;
    const position = elapsed / storyRate;
    audioOffset = null;
    if (audio.src !== score) audio.src = score;
    else if (audio.error) audio.load();
    if (Math.abs(audio.currentTime - position) > 0.12) audio.currentTime = position;
    try {
      await audio.play();
      if (pending !== attempt) return false;
      audioOffset = elapsed - audio.currentTime * storyRate;
      heardMusic = true;
      return true;
    } catch (error) {
      if (pending !== attempt) return false;
      musicWanted = false;
      updateSound();
      if (dialog.open && error.name !== "NotAllowedError") {
        sound.textContent = "Reintentar música";
        status.textContent = "Puedes volver a activar la música o seguir viendo la escena.";
      }
      return false;
    }
  };

  const describe = () => {
    const moment = sceneAt(elapsed);
    if (beat === moment.name) return;
    beat = moment.name;
    screen.dataset.beat = beat;
    status.textContent = [moment.description, moment.caption].filter(Boolean).join(" ");
    subtitle.textContent = moment.caption;
    subtitle.hidden = !moment.caption;
    previous.disabled = sceneStep(elapsed, -1) === null;
    next.disabled = sceneStep(elapsed, 1) === null;
  };

  const tick = now => {
    frame = 0;
    if (!dialog.open || paused) return;
    lastTick ??= now;
    const before = elapsed;
    const step = Math.min(100, now - lastTick) * storyRate / 1000;
    elapsed += step;
    lastTick = now;
    if (musicWanted && audioOffset !== null && !audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      const musicTime = audio.currentTime * storyRate + audioOffset;
      const correction = (musicTime - elapsed) * 0.16;
      elapsed = Math.max(before, elapsed + Math.min(2 * step, Math.max(-step, correction)));
    }
    if (elapsed >= ceremony.end) {
      dialog.close();
      return;
    }

    draw(elapsed);
    describe();
    if (elapsed >= ceremony.dissolve) {
      if (before < ceremony.dissolve) envelope.present();
      const opacity = 1 - fade(elapsed, ceremony.dissolve, ceremony.end - ceremony.dissolve);
      dialog.style.setProperty("--exit-opacity", String(opacity));
    }
    frame = requestAnimationFrame(tick);
  };

  const prepareScene = withSound => {
    deck.beginIntro();
    dialog.classList.remove("is-paused");
    dialog.style.removeProperty("--exit-opacity");
    elapsed = 0;
    lastTick = null;
    paused = false;
    musicWanted = withSound;
    heardMusic = false;
    beat = "";
    updateSound();
    pause.textContent = "Pausar escena";
    draw(0);
    describe();
    audio.volume = 1;
  };

  const presentEntry = ({ focus = false } = {}) => {
    entryActive = true;
    root.dataset.openingScene = "";
    startEntry.disabled = !frameReady;
    silentEntry.hidden = true;
    entryStatus.textContent = frameReady ? "" : "Preparando la escena…";
    audio.preload = "auto";
    if (audio.src !== score) audio.src = score;
    if (focus) document.getElementById("opening-title").focus({ preventScroll: true });
  };

  const leaveEntry = () => {
    entryActive = false;
    entryAttempt++;
    clearTimeout(audioNotice);
    root.removeAttribute("data-opening-scene");
  };

  const launch = () => {
    dialog.showModal();
    leaveEntry();
    frame = requestAnimationFrame(tick);
  };

  const cancelEntry = () => {
    leaveEntry();
    stopMusic();
    audio.preload = originalPreload;
    audio.volume = 1;
    deck.endIntro({ withSound: false });
  };

  startEntry.addEventListener("click", async () => {
    if (!entryActive || startEntry.disabled) return;
    const current = ++entryAttempt;
    startEntry.disabled = true;
    entryStatus.textContent = "Iniciando la marcha…";
    silentEntry.hidden = true;
    prepareScene(true);
    audioNotice = setTimeout(() => {
      entryStatus.textContent = "La música está tardando. Puedes esperar o ver la escena sin música.";
      silentEntry.hidden = false;
    }, 8000);
    // Call play in the button's gesture and wait for the browser to start it before advancing a frame.
    const playing = await startMusic();
    if (current !== entryAttempt) return;
    clearTimeout(audioNotice);
    if (playing) {
      launch();
    } else {
      deck.endIntro({ withSound: false });
      entryStatus.textContent = "No pudimos iniciar la música. Inténtalo otra vez o mira la escena sin música.";
      startEntry.disabled = false;
      silentEntry.hidden = false;
      startEntry.focus({ preventScroll: true });
    }
  });
  silentEntry.addEventListener("click", () => {
    if (!entryActive) return;
    stopMusic();
    prepareScene(false);
    launch();
  });
  window.addEventListener("hashchange", () => { if (entryActive) cancelEntry(); });
  const moveScene = direction => {
    const target = sceneStep(elapsed, direction);
    if (!dialog.open || target === null) return;
    elapsed = target + (paused && target > 0 ? 0.48 : 0);
    lastTick = null;
    dialog.style.removeProperty("--exit-opacity");
    draw(elapsed);
    describe();
    if (musicWanted && !paused) {
      void startMusic();
    }
  };
  previous.addEventListener("click", () => moveScene(-1));
  next.addEventListener("click", () => moveScene(1));
  sound.addEventListener("click", () => {
    musicWanted = !musicWanted;
    updateSound();
    if (!musicWanted) stopMusic();
    else if (!paused) void startMusic();
  });
  pause.addEventListener("click", () => {
    paused = !paused;
    dialog.classList.toggle("is-paused", paused);
    pause.textContent = paused ? "Continuar escena" : "Pausar escena";
    if (paused) {
      cancelAnimationFrame(frame);
      stopMusic();
    } else {
      lastTick = null;
      if (musicWanted) void startMusic();
      frame = requestAnimationFrame(tick);
    }
  });
  dialog.addEventListener("close", () => {
    const completed = elapsed >= ceremony.end;
    cancelAnimationFrame(frame);
    holdingScore = completed && musicWanted && heardMusic;
    if (!holdingScore) releaseScore({ withSound: false });
    if (completed) envelope.present({ focus: true });
    else presentEntry({ focus: true });
  });

  const releaseScore = ({ withSound = true } = {}) => {
    holdingScore = false;
    stopMusic();
    audio.preload = originalPreload;
    deck.endIntro({ withSound });
  };
  audio.addEventListener("ended", () => {
    if (!holdingScore) return;
    audio.currentTime = ambienceStart;
    void audio.play().catch(() => {});
  });
  cover.querySelector(".cover__entry").addEventListener("click", event => {
    if (holdingScore && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) releaseScore();
  });
  new MutationObserver(() => {
    if (holdingScore && cover.hidden) releaseScore();
  }).observe(cover, { attributes: true, attributeFilter: ["hidden"] });

  style.addEventListener("load", () => {
    if (root.hasAttribute("data-opening-scene")) presentEntry();
    void firstFrame.decode().catch(() => { firstFrame.hidden = true; }).then(() => {
      frameReady = true;
      if (entryActive) {
        startEntry.disabled = false;
        entryStatus.textContent = "";
      }
    });
  }, { once: true });
  style.addEventListener("error", () => root.removeAttribute("data-opening-scene"), { once: true });
  document.head.append(style);
};
