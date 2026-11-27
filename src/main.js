import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";
import { mountDeck } from "./deck.js";

const invitation = document.documentElement;
const hasMedia = invitation.hasAttribute("data-wedding-media");
const tracks = {};

// Keep the same media element from the opening scene through the album.
const audio = new Audio();
const deck = mountDeck(tracks, audio);
const album = mountAlbum({ onChapter: deck.select, onOpen: deck.setBookOpen });
mountReadingProgress();

if (hasMedia) {
  const preview = await import("../private-preview/preview.js").catch(() => null);
  if (preview) {
    Object.assign(tracks, preview.tracks);
    album?.updateTrackLinks(tracks);
    deck.updateTracks();
    preview.mount({ audio, deck });
  }
}
