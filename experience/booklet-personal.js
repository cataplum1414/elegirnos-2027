import { fade, mix } from "./scene-story.js";

export const personalAtlases = {
  interests: "libreto-aficiones.webp",
  cinema: "libreto-cine.webp",
  tastes: "libreto-gustos.webp"
};

export const personalScenes = {
  toast: { activity: "cafe-y-vino", seconds: 4.4, atlas: "interests", draw: toast },
  kitchen: { activity: "cocina", seconds: 4.6, atlas: "interests", draw: kitchen },
  computer: { activity: "computacion", seconds: 4.7, atlas: "interests", draw: computer },
  postcards: { activity: "postales", seconds: 3.9, atlas: "interests", draw: postcards },
  cinema: { activity: "cine-romantico", seconds: 6.4, atlas: "cinema", draw: cinema },
  dinner: { activity: "pizza-y-cena", seconds: 4.6, atlas: "tastes", draw: dinner },
  concert: { activity: "concierto", seconds: 4.5, atlas: "tastes", draw: concert },
  shopping: { activity: "compras", seconds: 4.2, atlas: "tastes", draw: shopping },
  soap: { activity: "novela", seconds: 5, atlas: "tastes", draw: soap }
};

// Crop boundaries leave a transparent margin around each scene.
const poses = {
  toast: [144, 6, 616, 501],
  kitchen: [860, 6, 1403, 501],
  computer: [73, 541, 678, 1014],
  postcards: [826, 518, 1461, 1013],
  cinema: [[62, 9, 950, 756], [1089, 8, 1983, 757]],
  dinner: [107, 13, 686, 508],
  concert: [891, 10, 1355, 507],
  shopping: [122, 519, 705, 1018],
  soap: [820, 525, 1440, 1018]
};

function steam(context, x, y, height, time) {
  for (const phase of [0, 0.48]) {
    const rise = (time * 0.73 + phase) % 1;
    const curl = Math.sin(rise * Math.PI * 2) * height * 0.05;
    const steamY = y - rise * height * 0.15;
    context.beginPath();
    context.moveTo(x + curl, steamY);
    context.quadraticCurveTo(x - curl, steamY - height * 0.046, x + curl, steamY - height * 0.087);
    context.lineWidth = 1.25;
    context.strokeStyle = `rgba(255, 230, 195, ${Math.sin(rise * Math.PI) * 0.79})`;
    context.stroke();
  }
}

function toast({ context, center, floor, height, sprite }, time) {
  const touch = fade(time, 0.30, 0.67) * (1 - fade(time, 1.30, 0.6));
  sprite("interests", poses.toast, center, { angle: mix(-0.022, 0, touch), lift: touch * 1.2 });
  steam(context, center - height * 0.071, floor - height * 0.74, height, time);
  context.save();
  context.globalAlpha *= Math.max(0, 1 - Math.abs(time - 1.04) / 0.22);
  context.strokeStyle = "#ffe5a8";
  context.lineWidth = 1.4;
  const y = floor - height * 0.77;
  context.beginPath();
  context.moveTo(center - 2, y - 1);
  context.lineTo(center - 4, y - 5);
  context.moveTo(center + 2, y - 1);
  context.lineTo(center + 5, y - 4);
  context.stroke();
  context.restore();
}

function kitchen({ context, center, floor, height, sprite }, time) {
  sprite("interests", poses.kitchen, center);
  const potY = floor - height * 0.50;
  steam(context, center + height * 0.011, potY, height, time);
  steam(context, center + height * 0.069, potY - 1, height, time + 0.43);
}

const pixelHeart = [
  ".##.##.",
  "#######",
  "#######",
  ".#####.",
  "..###..",
  "...#..."
];

function computer({ context, center, floor, height, sprite }, time) {
  sprite("interests", poses.computer, center);
  const x = center - height * 0.062;
  const y = floor - height * 0.648;
  const pixel = height * 0.020;

  if (time < 1.54) {
    context.fillStyle = "#9bddc2";
    for (let row = 0; row < 3; row++) {
      const progress = fade(time, row * 0.32, 0.48);
      context.fillRect(x - pixel * 3, y + (row - 1) * pixel * 2, pixel * 6 * progress, pixel * 0.72);
    }
    return;
  }

  context.save();
  context.globalAlpha *= fade(time, 1.54, 0.25);
  context.fillStyle = "#f59199";
  for (const [row, line] of pixelHeart.entries()) {
    for (let column = 0; column < line.length; column++) {
      if (line[column] === "#") context.fillRect(x + (column - 3.5) * pixel, y + (row - 3) * pixel, pixel, pixel);
    }
  }
  context.restore();
}

function postcard(context, x, y, size, coast) {
  context.save();
  context.translate(x, y);
  context.rotate(coast ? 0.11 : -0.10);
  context.scale(size, size);
  context.fillStyle = "#f4dfbd";
  context.fillRect(-0.5, -0.35, 1, 0.7);
  context.fillStyle = coast ? "#b9d5ce" : "#d7c9a1";
  context.fillRect(-0.44, -0.29, 0.88, 0.56);

  if (coast) {
    context.fillStyle = "#457e87";
    context.fillRect(-0.44, 0.01, 0.88, 0.26);
    context.fillStyle = "#e9cc9e";
    context.fillRect(-0.38, 0.12, 0.54, 0.035);
    context.beginPath();
    context.moveTo(0.21, 0.24);
    context.quadraticCurveTo(0.19, 0.01, 0.27, -0.10);
    context.quadraticCurveTo(0.06, -0.06, 0.04, -0.13);
    context.quadraticCurveTo(0.20, -0.26, 0.28, -0.15);
    context.quadraticCurveTo(0.35, -0.25, 0.43, -0.12);
    context.lineTo(0.33, -0.08);
    context.lineTo(0.26, 0.24);
    context.closePath();
    context.fillStyle = "#34584e";
  } else {
    context.beginPath();
    context.moveTo(-0.44, 0.18);
    context.lineTo(-0.18, -0.17);
    context.lineTo(-0.02, 0.04);
    context.lineTo(0.14, -0.20);
    context.lineTo(0.44, 0.15);
    context.lineTo(0.44, 0.27);
    context.lineTo(-0.44, 0.27);
    context.closePath();
    context.fillStyle = "#486849";
  }

  context.fill();
  context.restore();
}

function postcards({ context, center, floor, height, sprite }, time) {
  sprite("interests", poses.postcards, center);
  const reveal = fade(time, 0.4, 0.62);
  const gap = height * mix(0.72, 0.96, reveal);
  context.save();
  context.globalAlpha *= reveal;
  postcard(context, center - gap, floor - height * 0.62, height * 0.43, false);
  postcard(context, center + gap, floor - height * 0.62, height * 0.43, true);
  context.restore();
}

function filmFigure(context, x, y, size, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y - size * 0.47, size * 0.13, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(x - size * 0.19, y);
  context.quadraticCurveTo(x - size * 0.15, y - size * 0.35, x, y - size * 0.35);
  context.quadraticCurveTo(x + size * 0.17, y - size * 0.35, x + size * 0.19, y);
  context.closePath();
  context.fill();
}

function cinema({ context, center, floor, height, sprite }, time) {
  const asleep = time >= 3.09;
  sprite("cinema", poses.cinema[Number(asleep)], center - height * 0.56, { height: height * 0.89 });
  filmScreen(context, center, floor, height, time);
}

function filmScreen(context, center, floor, height, time, drama = false) {
  const x = center + height * 0.09;
  const y = floor - height * 0.84;
  const width = height * 0.94;
  const filmHeight = height * 0.60;
  context.fillStyle = "#edcc9e";
  context.fillRect(x, y, width, filmHeight);
  context.fillStyle = "#231b28";
  context.fillRect(x + 1, y + 1, width - 2, filmHeight - 2);
  context.fillStyle = drama ? "#697688" : "#925e62";
  context.fillRect(x + 3, y + filmHeight * 0.15, width - 6, filmHeight * 0.70);
  context.fillStyle = drama ? "#c3d6d7" : "#f1c199";
  context.beginPath();
  context.arc(x + width * 0.60, y + filmHeight * 0.42, filmHeight * 0.17, 0, Math.PI * 2);
  context.fill();

  const gap = width * mix(0.19, drama ? 0.30 : 0.10, fade(time, 0.2, 2.6));
  const baseline = y + filmHeight * 0.85;
  filmFigure(context, x + width * 0.50 - gap, baseline, filmHeight * 0.96, "#271f2d");
  filmFigure(context, x + width * 0.50 + gap, baseline, filmHeight * 0.83, "#4e2937");
}

function dinner({ context, center, floor, height, sprite }, time) {
  sprite("tastes", poses.dinner, center);
  steam(context, center - height * 0.26, floor - height * 0.62, height * 0.75, time);
  const gleam = Math.max(0, 1 - Math.abs(time - 2.05) / 0.56);
  context.save();
  context.globalAlpha *= gleam;
  context.strokeStyle = "#ffe8bc";
  context.lineWidth = 1.2;
  const x = center + height * 0.19;
  const y = floor - height * 0.66;
  context.beginPath();
  context.moveTo(x - 2, y);
  context.lineTo(x + 2, y);
  context.moveTo(x, y - 2);
  context.lineTo(x, y + 2);
  context.stroke();
  context.restore();
}

function concert({ context, center, floor, height, sprite }, time) {
  for (const [side, color] of [[-1, "#d6a15d88"], [1, "#9b84bd84"]]) {
    const shift = Math.sin(time * 1.55 + side * 0.73) * height * 0.25;
    const x = center + side * height * 1.02;
    const y = floor - height;
    const beam = context.createLinearGradient(x, y, center + shift, floor);
    beam.addColorStop(0, color);
    beam.addColorStop(1, "#0c0a1600");
    context.fillStyle = beam;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(center + shift - height * 0.32, floor);
    context.lineTo(center + shift + height * 0.32, floor);
    context.closePath();
    context.fill();
  }
  sprite("tastes", poses.concert, center);
}

function shopping({ center, approach, sprite }, time) {
  if (time < 0.86) {
    approach(center, 0.81, 0.42, fade(time, 0, 0.86));
    return;
  }
  sprite("tastes", poses.shopping, center);
}

function soap({ context, center, floor, height, sprite }, time) {
  sprite("tastes", poses.soap, center - height * 0.63, { height: height * 0.86 });
  filmScreen(context, center, floor, height, time, true);
}
