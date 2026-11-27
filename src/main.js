import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";
import { mountDeck } from "./deck.js";

const invitation = document.documentElement;
const hasMedia = invitation.hasAttribute("data-wedding-media");
const initialIntro = hasMedia && !location.hash;
const preview = hasMedia
  ? await import("../private-preview/preview.js").catch(() => null)
  : null;

// Keep the same media element from the opening scene through the album.
const audio = new Audio();
const deck = mountDeck(preview?.tracks, audio);
mountAlbum({ onChapter: deck.select, onOpen: deck.setBookOpen, tracks: preview?.tracks });
mountReadingProgress();
if (preview) preview.mount({ audio, deck, initialIntro });
else invitation.removeAttribute("data-intro-pending");
