import { mount as mountScene } from "./scene.js";
import { mountVignettes } from "./booklet-vignettes.js";

const asset = (file) => new URL(file, import.meta.url).href;

export const tracks = {
  1: asset("antes-de-ti.m4a"),
  2: asset("coincidir.m4a"),
  3: asset("ahi-estabas-tu.m4a"),
  4: asset("miel.m4a"),
  5: asset("cuando-quieras-llegar.m4a"),
  6: asset("creo-en-ti.m4a"),
  7: asset("bailaras-con-alegria.m4a"),
  8: asset("bogota.m4a")
};

export const mount = options => {
  mountScene(options);
  mountVignettes({
    tray: document.getElementById("disc-tray"),
    booklet: document.querySelector(".booklet"),
    audio: options.audio
  });
};
