import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";
import { mountDeck } from "./deck.js";

const invitation = document.documentElement;
const preview = invitation.hasAttribute("data-wedding-media")
  ? await import("../private-preview/preview.js").catch(() => null)
  : null;

// Keep the same media element from the opening scene through the album.
const audio = new Audio();
const deck = mountDeck(preview?.tracks, audio);
mountAlbum({ onChapter: deck.select });
mountReadingProgress();
const initialIntro = invitation.hasAttribute("data-intro-pending");
if (preview) preview.mount({ audio, deck, initialIntro });
else invitation.removeAttribute("data-intro-pending");
