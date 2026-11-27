import { interludes, interludeAtlases } from "./booklet-interludes.js";
import { personalAtlases, personalScenes } from "./booklet-personal.js";

const atlasFiles = {
  walk: "caminata-libretto.webp",
  couple: "libreto-encuentros.webp",
  dance: "libreto-baile.webp",
  gestures: "libreto-gestos.webp",
  pairedSteps: "libreto-pasos-en-pareja.webp",
  ...personalAtlases,
  ...interludeAtlases
};

// Crop boundaries in source pixels. A few transparent pixels surround each pose.
const couple = {
  jeisson: [150, 8, 381, 500],
  ornella: [401, 44, 630, 500]
};
const dance = [[44, 30, 850, 860], [914, 31, 1742, 860]];
const starPoses = [[130, 9, 648, 502], [890, 9, 1411, 502]];
const planePoses = [
  [[120, 520, 345, 1013, 233], [463, 556, 668, 1014, 539]],
  [[844, 519, 1133, 1013, 972], [1178, 559, 1439, 1014, 1301]]
];
const linkedSteps = [[110, 6, 652, 501], [882, 6, 1423, 501]];
const luggageSteps = [[27, 518, 703, 1020], [791, 518, 1485, 1021]];
const walk = [
  [[129, 19, 422, 497, 276], [146, 17, 348, 496, 251], [72, 18, 381, 495, 225]],
  [[128, 14, 433, 493, 284], [120, 14, 356, 493, 250], [78, 15, 410, 490, 238]]
];
const strides = [0, 1, 2, 1];
const mix = (a, b, progress) => a + (b - a) * progress;
const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};
const wave = value => Math.sin(value * 2 * Math.PI);

// Each track starts with its chapter's scene, then cycles through the complete story.
const scenes = [
  { activity: "caminos", seconds: 3.7, draw: paths },
  { activity: "saludo", seconds: 4, draw: greeting },
  { activity: "estrella", seconds: 4.8, draw: star },
  personalScenes.toast,
  { activity: "avion-de-papel", seconds: 4.8, draw: plane },
  { activity: "de-la-mano", seconds: 4.7, draw: hands },
  { activity: "baile", seconds: 5, draw: dancing },
  { activity: "maletas", seconds: 4.5, draw: luggage }
];
const sequence = scenes.map((scene, index) => [scene, ...interludes[index]]);
const actionPace = 0.84;
const poseHold = 0.48;
const storySeconds = sequence.flat().reduce((total, scene) => total + scene.seconds * actionPace + poseHold, 0);

const makeTimeline = (duration, first) => {
  const cycle = Math.min(duration, storySeconds);
  const sceneScale = cycle / storySeconds;
  const beats = [];
  let start = 0;

  for (let index = 0; index < sequence.length; index++) {
    for (const scene of sequence[(first + index) % sequence.length]) {
      const actionSeconds = scene.seconds * actionPace * sceneScale;
      const seconds = actionSeconds + poseHold * sceneScale;
      beats.push({ scene, start, seconds, actionSeconds });
      start += seconds;
    }
  }
  return { beats, cycle };
};

function paths({ center, span, walker }, _time, progress) {
  const start = span * 0.19;
  const covered = span * 0.79 * ease(progress);
  walker(0, center - start - covered, covered, { flip: true });
  walker(1, center + start + covered, covered);
}

function greeting({ center, height, face, approach }, time) {
  if (time < 0.88) {
    approach(center, 0.69, 0.33, ease(time / 0.88));
    return;
  }
  face(center, height * 0.33, wave(time * 1.2) * 0.025 * (1 - ease((time - 2.2) / 0.9)));
}

function star({ context, center, height, floor, sprite }, time) {
  const passed = ease((time - 0.80) / 1.5);
  sprite("gestures", starPoses[Number(passed >= 0.36)], center);
  const x = center + height * mix(0.028, -0.12, passed);
  const y = floor - height * (mix(0.73, 0.64, passed) + Math.sin(passed * Math.PI) * 0.20);
  context.save();
  context.translate(x, y);
  context.rotate(wave(time * 0.7) * 0.28);
  context.beginPath();
  for (let point = 0; point < 10; point++) {
    const angle = Math.PI * (point / 5 - 0.5);
    const radius = height * (point % 2 ? 0.052 : 0.125);
    context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  context.closePath();
  context.fillStyle = "#ffdea0";
  context.fill();
  context.strokeStyle = "#61321c";
  context.lineWidth = 1.05;
  context.stroke();
  context.restore();
}

function plane({ context, center, span, height, floor, sprite }, time) {
  const distance = Math.min(span * 0.75, height * 1.10);
  const flight = ease((time - 0.87) / 1.9);
  const [jeisson, ornella] = planePoses[Number(time >= 0.88)];
  sprite("gestures", jeisson, center - distance, { anchor: jeisson[4] });
  sprite("gestures", ornella, center + distance, { anchor: ornella[4], height: height * 0.925 });
  const pathX = progress => center + mix(-distance + height * 0.18, distance - height * 0.34, progress);
  const pathY = progress => floor - height * (mix(0.75, 0.63, progress) + Math.sin(progress * Math.PI) * 0.15);
  const opacity = context.globalAlpha;
  context.fillStyle = "#eacb8c";
  for (let dot = 1; dot <= 4; dot++) {
    const trail = flight - dot * 0.048;
    if (trail <= 0 || flight >= 1) break;
    context.globalAlpha = opacity * (5 - dot) * 0.15;
    context.fillRect(pathX(trail), pathY(trail), 2, 2);
  }
  context.save();
  context.globalAlpha = opacity * clamp((3.40 - time) / 0.53);
  context.translate(pathX(flight), pathY(flight));
  context.rotate((flight - 0.5) * 0.54);
  const size = height * 0.22;
  context.beginPath();
  context.moveTo(-size, -size * 0.42);
  context.lineTo(size, -size * 0.24);
  context.lineTo(-size * 0.28, size * 0.62);
  context.lineTo(-size * 0.42, 0);
  context.closePath();
  context.fillStyle = "#fff3dc";
  context.fill();
  context.beginPath();
  context.moveTo(-size * 0.42, 0);
  context.lineTo(size, -size * 0.24);
  context.strokeStyle = "#c78b61";
  context.lineWidth = 0.8;
  context.stroke();
  context.restore();
  context.globalAlpha = opacity;
}

function hands({ center, span, height, approach, sprite }, time) {
  const reach = ease(time / 0.94);
  if (reach < 1) {
    approach(center, 0.76, 0.31, reach);
    return;
  }
  const travel = Math.max(0, time - 1.1);
  const covered = span * 0.56 * ease(travel / 3.6);
  sprite("pairedSteps", linkedSteps[stepIndex(covered, height, linkedSteps.length)], center + covered);
}

function dancing({ context, center, height, floor, sprite }, time) {
  const pose = Math.floor(time * 2.8) % dance.length;
  sprite("dance", dance[pose], center + height * wave(time * 1.4) * 0.10);
  const colors = ["#ffd995", "#e39ca9", "#f2dfb9"];
  const opacity = context.globalAlpha;
  for (let piece = 0; piece < 6; piece++) {
    const fall = (time * 0.76 + piece / 6) % 1;
    const x = center + height * ((piece % 2 ? 1 : -1) * (0.63 + piece * 0.075) + wave(fall) * 0.11);
    context.globalAlpha = opacity * Math.sin(fall * Math.PI) * 0.85;
    context.fillStyle = colors[piece % colors.length];
    context.fillRect(x, floor - height * (1 - fall * 0.82), 2, 3);
  }
  context.globalAlpha = opacity;
}

function luggage({ center, span, height, sprite }, _time, progress) {
  const covered = span * 1.47 * ease(progress);
  sprite("pairedSteps", luggageSteps[stepIndex(covered, height, luggageSteps.length)], center - span * 0.71 + covered);
}

// Advance the foot contacts with the distance crossed and hold the pose when the body stops.
const stepIndex = (covered, height, frames, offset = 0) =>
  (Math.floor(covered / (height * 0.10)) + offset) % frames;

export const mountVignettes = ({ tray, booklet, audio }) => {
  const album = booklet.closest(".album-section");
  const pages = booklet.querySelector("#chapters");
  const edge = document.createElement("div");
  edge.className = "booklet-edge";
  edge.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;
  edge.append(canvas);
  booklet.prepend(edge);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const atlases = {};
  let first = 0;
  let trackDuration = 0;
  let timeline;
  let frame = 0;
  let stage;

  const sprite = (atlas, [left, top, right, bottom], x, {
    height = stage.height, angle = 0, flip = false, lift = 0, anchor = (left + right) / 2
  } = {}) => {
    if (!atlases[atlas]?.naturalWidth) return;
    const sourceWidth = right - left;
    const sourceHeight = bottom - top;
    const scale = height / sourceHeight;
    context.save();
    context.translate(x, stage.floor - lift);
    context.rotate(angle);
    if (flip) context.scale(-1, 1);
    context.drawImage(atlases[atlas], left, top, sourceWidth, sourceHeight,
      (left - anchor) * scale, -height, sourceWidth * scale, height);
    context.restore();
  };

  const walker = (actor, x, covered, options = {}) => {
    const height = stage.height * (actor ? 0.89 : 1);
    const pose = strides[stepIndex(covered, height, strides.length, actor)];
    const [left, top, right, bottom, anchor] = walk[actor][pose];
    const offsetX = pose * 512;
    const offsetY = actor * 512;
    sprite("walk", [offsetX + left - 4, offsetY + top - 4, offsetX + right + 4, offsetY + bottom + 4], x,
      { ...options, anchor: offsetX + anchor, height });
  };

  const approach = (center, from, to, progress) => {
    const gap = stage.height * mix(from, to, progress);
    const covered = stage.height * from - gap;
    walker(0, center - gap, covered);
    walker(1, center + gap, covered, { flip: true });
  };

  const face = (center, distance, angle) => {
    sprite("couple", couple.jeisson, center - distance, { angle });
    sprite("couple", couple.ornella, center + distance, { height: stage.height * 0.925, angle: -angle });
  };

  const measure = () => {
    const width = edge.clientWidth;
    const height = edge.clientHeight;
    if (!width || !height) return;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stage = {
      context, sprite, walker, approach, face, width, height: height - 3, floor: height - 1,
      center: width / 2, span: Math.min(width * 0.33, height * 3.1)
    };
  };

  const draw = () => {
    if (stage) {
      const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : storySeconds;
      if (!timeline || duration !== trackDuration) {
        trackDuration = duration;
        timeline = makeTimeline(duration, first);
      }
      const position = audio.currentTime % timeline.cycle;
      const { scene, start, seconds, actionSeconds } = timeline.beats.findLast(beat => beat.start <= position);
      const elapsed = position - start;
      const progress = clamp(elapsed / actionSeconds);
      if (edge.dataset.activity !== scene.activity) edge.dataset.activity = scene.activity;
      context.clearRect(0, 0, stage.width, stage.floor + 1);
      context.globalAlpha = Math.min(1, 0.34 + elapsed / 0.23, (seconds - elapsed) / 0.23);
      if (scene.atlas && !atlases[scene.atlas]?.naturalWidth) {
        face(stage.center, stage.height * 0.45, 0);
      } else {
        scene.draw(stage, progress * scene.seconds, progress);
      }
      context.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
  };

  const update = () => {
    const next = (Number(pages.querySelector(".chapter-card:not([hidden])")?.dataset.chapter) || 1) - 1;
    if (next !== first) {
      first = next;
      timeline = null;
    }
    const visible = tray.hasAttribute("data-playing") && !audio.muted && !reducedMotion.matches;
    edge.hidden = !visible;
    if (!album.hidden && !reducedMotion.matches) {
      for (const [name, file] of Object.entries(atlasFiles)) {
        if (atlases[name]) continue;
        const image = new Image();
        if (name in interludeAtlases) image.fetchPriority = "low";
        image.src = new URL(file, import.meta.url).href;
        atlases[name] = image;
      }
    }
    if (visible && !frame) {
      measure();
      frame = requestAnimationFrame(draw);
    }
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const observer = new MutationObserver(update);
  observer.observe(album, { attributes: true, attributeFilter: ["hidden"] });
  observer.observe(tray, { attributes: true, attributeFilter: ["data-playing"] });
  observer.observe(pages, { subtree: true, attributes: true, attributeFilter: ["hidden"] });
  new ResizeObserver(measure).observe(edge);
  reducedMotion.addEventListener("change", update);
  audio.addEventListener("volumechange", update);
  update();
};
