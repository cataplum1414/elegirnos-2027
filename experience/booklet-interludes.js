import { fade, mix } from "./scene-story.js";
import { personalScenes } from "./booklet-personal.js";

export const interludeAtlases = {
  activitiesA: "libreto-actividades-a.webp",
  activitiesB: "libreto-actividades-b.webp",
  proposal: "libreto-pedida.webp",
  ring: "anillo-estuche-corazon.webp"
};

// Crop coordinates include padding around the alpha bounds.
const poses = {
  umbrella: [226, 0, 573, 501],
  highFive: [862, 16, 1351, 501],
  photo: [213, 526, 621, 1014],
  headphones: [861, 525, 1351, 1014],
  disc: [147, 5, 618, 501],
  hug: [255, 515, 541, 1019],
  proposal: [[28, 14, 832, 878], [915, 11, 1746, 878]],
  ring: [152, 34, 1093, 1248]
};

export const interludes = [
  [
    { activity: "paraguas", seconds: 3.1, atlas: "activitiesA", draw: umbrella },
    personalScenes.postcards
  ],
  [{ activity: "choque-de-manos", seconds: 2.8, atlas: "activitiesA", draw: highFive }, personalScenes.shopping],
  [{ activity: "foto", seconds: 3.1, atlas: "activitiesA", draw: photo }, personalScenes.soap],
  [personalScenes.kitchen, personalScenes.dinner, { activity: "audifonos", seconds: 3.2, atlas: "activitiesA", draw: headphones }],
  [personalScenes.computer, { activity: "disco", seconds: 3, atlas: "activitiesB", draw: disc }],
  [{ activity: "pedida", seconds: 6, atlas: "proposal", draw: proposal }],
  [personalScenes.concert, personalScenes.cinema],
  [{ activity: "abrazo", seconds: 2.8, atlas: "activitiesB", draw: hug }]
];

const pulse = (time, peak, width) => Math.max(0, 1 - Math.abs(time - peak) / width);

function glint(context, x, y, radius, opacity) {
  if (opacity <= 0) return;
  const inner = radius * 0.22;
  context.save();
  context.globalAlpha *= opacity;
  context.fillStyle = "#ffebbd";
  context.beginPath();
  context.moveTo(x, y - radius);
  context.lineTo(x + inner, y - inner);
  context.lineTo(x + radius, y);
  context.lineTo(x + inner, y + inner);
  context.lineTo(x, y + radius);
  context.lineTo(x - inner, y + inner);
  context.lineTo(x - radius, y);
  context.lineTo(x - inner, y - inner);
  context.closePath();
  context.fill();
  context.restore();
}

function note(context, x, y, size, opacity) {
  context.save();
  context.globalAlpha *= opacity;
  context.fillStyle = "#efc58d";
  context.strokeStyle = "#efc58d";
  context.lineWidth = 1.05;
  context.beginPath();
  context.ellipse(x, y, size * 0.23, size * 0.15, -0.42, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(x + size * 0.21, y);
  context.lineTo(x + size * 0.21, y - size);
  context.quadraticCurveTo(x + size * 0.64, y - size * 0.78, x + size * 0.59, y - size * 0.50);
  context.stroke();
  context.restore();
}

function umbrella({ context, center, height, floor, sprite }, time, progress) {
  const x = center + height * mix(-0.18, 0.18, progress);
  context.save();
  context.strokeStyle = "#c0c5cc92";
  context.lineWidth = 1.15;
  context.beginPath();
  for (let drop = 0; drop < 12; drop++) {
    const fall = (time * 1.26 + drop * 0.31) % 1;
    const side = drop < 6 ? -1 : 1;
    const left = x + side * height * (0.40 + (drop % 6) * 0.105);
    const top = floor - height * (1 - fall * 0.94);
    context.moveTo(left, top);
    context.lineTo(left - height * 0.046, top + height * 0.10);
  }
  context.stroke();
  context.restore();
  sprite("activitiesA", poses.umbrella, x);
}

function highFive({ context, center, height, floor, approach, sprite }, time) {
  const touch = 0.86;
  if (time < touch) {
    approach(center, 0.70, 0.41, fade(time, 0, touch));
    return;
  }
  sprite("activitiesA", poses.highFive, center);
  glint(context, center + height * 0.065, floor - height * 0.87, height * 0.107, pulse(time, 1.05, 0.26));
}

function photo({ context, center, height, floor, sprite }, time) {
  sprite("activitiesA", poses.photo, center, { angle: mix(-0.018, 0, fade(time, 0, 1.18)) });
  const exposure = pulse(time, 1.50, 0.20);
  glint(context, center + height * 0.317, floor - height * 0.858, height * 0.126, exposure);
}

function headphones({ context, center, height, floor, sprite }, time) {
  sprite("activitiesA", poses.headphones, center);
  const float = (time * 0.73) % 1;
  note(context, center + height * (0.58 + float * 0.22), floor - height * (0.37 + 0.46 * float),
    height * 0.115, Math.sin(float * Math.PI) * 0.88);
}

function disc({ context, center, height, floor, sprite }, time) {
  sprite("activitiesB", poses.disc, center, { angle: Math.sin(time * 4.8) * 0.019 });
  const offset = time * 4.7;
  glint(context, center + height * (-0.057 + Math.cos(offset) * 0.083),
    floor - height * (0.722 + Math.sin(offset) * 0.083), height * 0.062, 0.64);
}

function proposal({ context, center, height, floor, approach, sprite }, time) {
  if (time < 0.73) {
    approach(center, 0.65, 0.44, fade(time, 0, 0.73));
    return;
  }
  const openAt = 2.28;
  const reveal = fade(time, openAt + 0.18, 0.52);
  const actorsX = center - height * 0.24 * reveal;
  sprite("proposal", poses.proposal[Number(time >= openAt)], actorsX, { height: height * 0.93 });
  glint(context, actorsX - height * 0.021, floor - height * 0.58, height * 0.102, pulse(time, 2.53, 0.29));

  if (reveal > 0) {
    const iconX = center + height * 0.68;
    context.save();
    context.globalAlpha *= reveal;
    sprite("ring", poses.ring, iconX, {
      height: height * mix(0.46, 0.66, reveal),
      lift: height * 0.16
    });
    glint(context, iconX + height * 0.13, floor - height * 0.72, height * 0.075, pulse(time, 3.35, 0.43));
    context.restore();
  }
}

function hug({ center, approach, sprite }, time) {
  if (time < 0.90) {
    approach(center, 0.90, 0.29, fade(time, 0, 0.9));
    return;
  }
  sprite("activitiesB", poses.hug, center);
}
