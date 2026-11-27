import { mountAlbum } from "./album.js";
import { mountReadingProgress } from "./progress.js";
import { mountDeck } from "./deck.js";

const isLocalPreview = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
  && new URLSearchParams(location.search).has("previa");
const preview = isLocalPreview
  ? await import("../private-preview/preview.js").catch(() => null)
  : null;

const deck = mountDeck(preview?.tracks);
mountAlbum({ onChapter: deck.select });
mountReadingProgress();
preview?.mount({ pauseAlbum: deck.pause });
