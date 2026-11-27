const tile = 512;
const footline = 509;
const padding = 6;

// Alpha bounds and face anchors in each running frame, in playback order.
const rectangles = {
  jei: [
    [87, 17, 427, 496, 281], [120, 20, 365, 493, 283], [89, 14, 385, 491, 286],
    [84, 16, 460, 492, 282], [112, 21, 363, 496, 285], [85, 15, 400, 490, 289]
  ],
  orne: [
    [98, 11, 438, 490, 299], [120, 13, 386, 494, 299], [119, 11, 389, 493, 301],
    [83, 13, 455, 478, 299], [122, 13, 389, 498, 300], [112, 13, 394, 497, 303]
  ]
};

// The gesture atlas is calibrated to the same head size and floor line as the run loop.
const actions = {
  jei: { stop: [768, 14, 1074, 601, 918, 0.81], gesture: [64, 134, 574, 601, 414, 0.81] },
  orne: { stop: [145, 645, 473, 1245, 388, 0.797], gesture: [699, 645, 1194, 1244, 922, 0.797] }
};
const actionAtlas = new Image();
actionAtlas.src = new URL("persecucion-poses.webp", import.meta.url).href;

const makeFrame = ([left, top, right, bottom, anchor, scale = 1], offsetX = 0, offsetY = 0) => ({
  x: offsetX + left - padding,
  y: offsetY + top - padding,
  width: right - left + 2 * padding,
  height: bottom - top + 2 * padding,
  left: (left - anchor - padding) * scale,
  top: footline - (bottom - top + padding) * scale,
  scale
});

export const createRunner = (canvas, name) => {
  const context = canvas.getContext("2d");
  if (!context) return () => {};

  const sheet = new Image();
  const frames = rectangles[name].map((rect, index) => makeFrame(rect, (index % 3) * tile, Math.floor(index / 3) * tile));
  const restingFrame = makeFrame(actions[name].stop);
  const gestureFrame = makeFrame(actions[name].gesture);
  let requested = [1, 0, 0];
  let rendered = "";
  let warmedUp = false;
  context.imageSmoothingQuality = "high";

  const paint = (source, frame) => {
    context.drawImage(source, frame.x, frame.y, frame.width, frame.height,
      canvas.width / 2 + frame.left, frame.top, frame.width * frame.scale, frame.height * frame.scale);
  };

  const show = (phase, rest = 0, gesture = 0) => {
    requested = [phase, rest, gesture];
    if (!warmedUp) return;

    const ready = actionAtlas.naturalWidth === 1254 && actionAtlas.naturalHeight === 1254;
    const step = Math.floor(phase);
    const index = ((step % frames.length) + frames.length) % frames.length;
    const pose = ready && gesture >= 0.5 ? "gesture" : ready && rest >= 0.5 ? "stop" : "run";
    const signature = pose === "run" ? `run-${index}` : pose;
    if (signature === rendered) return;
    rendered = signature;

    context.clearRect(0, 0, canvas.width, canvas.height);
    // Each cel has one clear silhouette and the same floor line.
    if (pose === "gesture") paint(actionAtlas, gestureFrame);
    else if (pose === "stop") paint(actionAtlas, restingFrame);
    else paint(sheet, frames[index]);
    canvas.dataset.step = String(index + 1);
    canvas.dataset.pose = pose;
  };

  sheet.addEventListener("load", () => {
    if (sheet.naturalWidth !== tile * 3 || sheet.naturalHeight !== tile * 2) return;
    warmedUp = true;
    show(...requested);
    canvas.dataset.ready = "";
  }, { once: true });
  sheet.src = new URL(`${name}-pasos.webp`, import.meta.url).href;

  return show;
};
