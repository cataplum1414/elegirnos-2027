import { createRunner } from "./run-frames.js";
import { ceremony, consoleCue, drawStory, fade, mix, openingLead, pursuitDelay, keyDelay, unit } from "./scene-story.js";

// Timing relative to the start of the pursuit.
const gags = [
  { launch: 3.36, hit: 4.90, end: 5.62, action: "duck" },
  { launch: 6.74, hit: 7.94, end: 9.04, action: "jump" },
  { launch: 10.76, hit: 11.94, end: 13.16, action: "skid" }
];
const brakeStart = 11.94;
const brakeLength = 2.06;
const bump = progress => Math.sin(Math.PI * unit(progress)) ** 2;

const strideTime = seconds => {
  const progress = unit((seconds - brakeStart) / brakeLength);
  // Integrate the easing curve so the rhythm reaches a stop without a jump in phase.
  return Math.min(seconds, brakeStart) + brakeLength * (progress - progress ** 3 + progress ** 4 / 2);
};

export const mountMotion = (screen, reducedMotion) => {
  const showJei = createRunner(screen.querySelector(".chase__run-frame--jei"), "jei");
  const showOrne = createRunner(screen.querySelector(".chase__run-frame--orne"), "orne");
  const effects = [...screen.querySelectorAll(".chase__throw")];
  const comic = screen.querySelector(".chase__comic");
  const surprises = { duck: "¡Fsssh!", jump: "¡Fiu!", skid: "¡Zas!" };

  return elapsed => {
    const seconds = Math.max(0, elapsed - pursuitDelay);
    const afterKey = seconds - keyDelay;
    const still = reducedMotion.matches;
    const caught = elapsed >= ceremony.meet;
    const travel = fade(seconds, 2.46, 11.48);
    const brake = fade(seconds, brakeStart, brakeLength);
    const guardianReaction = fade(seconds, 12.94, 0.28) * (1 - fade(seconds, 14.38, 0.34));
    const consolePortrait = fade(elapsed, consoleCue - 0.53, 0.43) * (1 - fade(elapsed, openingLead + 2.33, 0.34));
    const jeiPortrait = Math.max(consolePortrait, guardianReaction);
    const fairyPortrait = fade(elapsed, ceremony.portrait, 0.55) * (1 - fade(elapsed, ceremony.court, 0.85));
    const magic = fade(elapsed, ceremony.meet - 0.18, 1.4);
    const run = still && !caught ? 0 : travel;
    const pursuit = mix(22, 37, run);
    const lead = mix(59, 74, run);
    const gag = gags.find(({ launch, end }) => !still && seconds >= launch && seconds < end);
    const reaction = gag ? bump((seconds - (gag.hit - 0.30)) / (gag.end - gag.hit + 0.3)) : 0;
    const toss = gag ? 1 - fade(seconds, gag.launch, 0.45) : bump((afterKey - 15.08) / 0.97);
    const jump = gag?.action === "jump" ? reaction : 0;
    const stride = strideTime(seconds) - (brakeStart + brakeLength / 2);
    const jeiPhase = still ? 1 : 1 + stride * 12.6;
    const ornePhase = still ? 1 : 4 + stride * 13.6;
    const rest = still ? Number(seconds >= brakeStart + brakeLength) : fade(seconds, 13.32, 0.65);
    const duckPose = still ? 0 : fade(seconds, 4.42, 0.15) * (1 - fade(seconds, 5.12, 0.18));
    const throwPose = still ? 0 : fade(afterKey, 15.27, 0.13) * (1 - fade(afterKey, 15.93, 0.19));

    screen.style.setProperty("--jei-x", `${lead + (gag?.action === "skid" ? 3 * reaction : 0)}%`);
    screen.style.setProperty("--orne-x", `${pursuit}%`);
    screen.style.setProperty("--pan", `${-9 * run}%`);
    screen.style.setProperty("--pace", String(still || caught ? 0 : (0.34 + 0.48 * bump(travel)) * (1 - brake)));
    screen.style.setProperty("--magic", String(magic));
    screen.style.setProperty("--jei-cut", String(jeiPortrait));
    screen.style.setProperty("--orne-cut", String(fairyPortrait));
    screen.style.setProperty("--shot-time", String(unit((elapsed - consoleCue) / 4.6)));
    screen.style.setProperty("--fairy-time", String(unit((elapsed - ceremony.portrait) / 3.55)));
    screen.style.setProperty("--jump", String(jump));
    screen.style.setProperty("--duck", String(gag?.action === "duck" ? reaction : 0));
    screen.style.setProperty("--skid", String(gag?.action === "skid" ? reaction : 0));
    screen.style.setProperty("--toss", String(toss));
    screen.style.setProperty("--brake", String(still ? 0 : brake * (1 - rest)));
    screen.style.setProperty("--jei-rise", String(still ? 0 : 0.20 * jump));
    screen.toggleAttribute("data-caught", caught);
    screen.toggleAttribute("data-court", elapsed >= ceremony.court);
    screen.toggleAttribute("data-dust", !still && ((brake > 0.18 && seconds < 14.7) || (gag?.action === "skid" && reaction > 0.25)));
    screen.toggleAttribute("data-proposing", elapsed >= ceremony.proposal);
    screen.toggleAttribute("data-ring", elapsed >= ceremony.ringIn && elapsed < ceremony.ringOut);
    if (gag) screen.dataset.gag = gag.action;
    else delete screen.dataset.gag;

    comic.hidden = !gag || seconds < gag.launch + 0.24;
    if (gag && comic.textContent !== surprises[gag.action]) comic.textContent = surprises[gag.action];

    gags.forEach(({ launch, hit, end }, index) => {
      const effect = effects[index];
      const flying = gags[index] === gag;
      effect.hidden = !flying;
      if (!flying) return;

      const journey = unit((seconds - launch) / (hit - launch));
      const through = unit((seconds - hit) / (end - hit));
      const height = 0.77 + 0.46 * bump(journey) - 0.12 * through;
      effect.style.left = `${mix(pursuit + 5, lead, journey) + 19 * through}%`;
      effect.style.bottom = `calc(var(--floor) + var(--character-height) * ${height})`;
      effect.style.transform = `translate(-50%, 50%) rotate(${mix(-17, 21, journey) + 86 * through}deg) scale(${0.55 + 0.55 * journey - 0.28 * through})`;
      effect.style.opacity = String(Math.min(1, journey * 9, (1 - through) * 4));
    });

    showJei(jeiPhase, rest, duckPose);
    showOrne(ornePhase, rest, throwPose);
    drawStory(screen, elapsed, still);
  };
};
