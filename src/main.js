import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";
import { mountDeck } from "./deck.js";

const invitation = document.documentElement;
const hasMedia = invitation.hasAttribute("data-wedding-media");
const tracks = {};

// Keep the same media element from the opening scene through the album.
const audio = new Audio();
const deck = mountDeck(tracks, audio, number => album?.advanceAfter(number));
const album = mountAlbum({ onChapter: deck.select, onOpen: deck.setBookOpen });
mountReadingProgress();

if (hasMedia) {
  const releaseOpening = () => invitation.removeAttribute("data-opening-scene");
  document.getElementById("opening-skip")?.addEventListener("click", () => {
    releaseOpening();
    document.querySelector(".cover__entry")?.focus({ preventScroll: true });
  }, { once: true });
  if (invitation.hasAttribute("data-opening-scene")) {
    window.addEventListener("hashchange", releaseOpening, { once: true });
  }
  const preview = await import("../private-preview/preview.js").catch(() => null);
  if (preview) {
    Object.assign(tracks, preview.tracks);
    album?.updateTrackLinks(tracks);
    deck.updateTracks();
    preview.mount({ audio, deck });
  } else {
    releaseOpening();
  }
}
