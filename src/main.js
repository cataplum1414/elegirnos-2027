import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";
import { mountDeck } from "./deck.js";
import { mountCountdown } from "./countdown.js?v=20261128-5";
import { mountVipClub } from "./vip-club.js?v=20261128-10";

const invitation = document.documentElement;
const hasMedia = invitation.hasAttribute("data-wedding-media");
const tracks = {};

// Keep the same media element from the opening scene through the album.
const audio = new Audio();
const deck = mountDeck(tracks, audio, number => album?.advanceAfter(number));
const album = mountAlbum({ onChapter: deck.select, onOpen: deck.setBookOpen });
mountReadingProgress();
mountCountdown();
mountVipClub();

if (hasMedia) {
  const releaseOpening = () => invitation.removeAttribute("data-opening-scene");
  if (invitation.hasAttribute("data-opening-scene")) {
    window.addEventListener("hashchange", releaseOpening, { once: true });
  }
  const experience = await import("../experience/index.js?v=20261128-2").catch(() => null);
  if (experience) {
    Object.assign(tracks, experience.tracks);
    album?.updateTrackLinks(tracks);
    deck.updateTracks();
    experience.mount({ audio, deck });
  } else {
    releaseOpening();
  }
}
