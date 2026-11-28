export const openingLead = 5.80;
export const consoleCue = 4.00;
export const pursuitDelay = 3.24 + openingLead;
const afterOpening = time => time + pursuitDelay;

export const keyDelay = 3.10;
const afterKey = time => afterOpening(time + keyDelay);
const keyPlan = 14.82;

export const ceremony = {
  meet: afterKey(21.36),
  lookOut: afterKey(24.25),
  portrait: afterKey(26.12),
  court: afterKey(29.17),
  proposal: afterKey(30.92),
  ringIn: afterKey(33.67),
  ringOut: afterKey(37.92),
  reply: afterKey(38.92),
  invitation: afterKey(43.22),
  dissolve: afterKey(47.62),
  end: afterKey(49.27)
};

const scenes = [
  { start: 0, name: "premiere", caption: "Ornella · Te guardé un puesto. ¿Qué película escogiste?", description: "En el cine de una estación espacial, Ornella llega con las dos entradas y encuentra a Jeisson frente al proyector." },
  { start: consoleCue, name: "close-up", caption: "Jeisson · La nuestra. Me falta preparar el final.", description: "Jeisson sale hacia la sala con la llave del proyector y una sorpresa guardada." },
  { start: openingLead + 2.38, name: "dropped-key", caption: "", description: "Jeisson esconde un estuche rojo en forma de corazón en su chaqueta. La llave dorada en forma de estrella se le cae del bolsillo." },
  { start: openingLead + 4.14, name: "return-key", caption: "Ornella · ¡Espérame! Se te cayó la estrella.", description: "Ornella atrapa la llave antes de que toque el suelo y corre tras Jeisson para devolverla." },
  { start: afterOpening(2.76), name: "ship", caption: "Ornella · ¡Agáchate, Jeisson!", description: "Una nave de carga sobrevuela el corredor mientras Ornella intenta alcanzar a Jeisson. Él se agacha para dejarla pasar." },
  { start: afterOpening(7.94), name: "guardian", caption: "Jeisson · Sin la estrella no puedo abrir la sala.", description: "Un robot gigante bloquea la entrada del cine. Jeisson frena y busca la llave en su bolsillo." },
  { start: afterOpening(keyPlan), name: "key-plan", caption: "Ornella · La estrella va en el pecho del guardián. Así abriré la sala.", description: "En primer plano, Ornella muestra la llave y señala la ranura del guardián." },
  { start: afterKey(15.36), name: "key", caption: "", description: "Ornella se acerca al guardián y coloca la llave en la ranura." },
  { start: afterKey(18.56), name: "path", caption: "", description: "La estrella enciende al guardián y abre la sala. Ornella le ofrece la mano a Jeisson." },
  { start: ceremony.meet, name: "gate", caption: "Ornella · Este final lo vemos juntos.", description: "La Marcha Imperial da paso a la música de cuento. Ornella y Jeisson cruzan las puertas doradas y salen unos pájaros." },
  { start: ceremony.lookOut, name: "castle", caption: "", description: "Las puertas se abren a un castillo de cuento con torres de piedra y ventanas iluminadas." },
  { start: ceremony.portrait, name: "princess", caption: "", description: "Ornella se vuelve hacia Jeisson con su vestido rosado de princesa." },
  { start: ceremony.proposal, name: "proposal", caption: "Jeisson · ¿Te quieres casar conmigo?", description: "En el castillo, Jeisson se arrodilla con su traje de príncipe y le ofrece el anillo de rubí a Ornella, vestida de rosa." },
  { start: ceremony.ringIn, name: "ruby", caption: "", description: "El rubí brilla en la caja que Jeisson llevaba escondida." },
  { start: ceremony.reply, name: "reply", caption: "Ornella · Sí. Y la próxima vez, vamos juntos.", description: "Ornella acepta. Los dos sonríen y sostienen una invitación de papel marfil." },
  { start: ceremony.invitation, name: "invitation", caption: "Ornella y Jeisson · Ahora, abre nuestro sobre.", description: "Los dos acercan hacia el público el sobre atado con cordón y sellado con lacre." },
  { start: ceremony.dissolve, name: "end", caption: "", description: "La escena termina y aparece el sobre sellado de la invitación." }
];

export const sceneStep = (time, direction) => {
  const index = scenes.findLastIndex(scene => time >= scene.start);
  const target = scenes[index + direction];
  return target && target.name !== "end" ? target.start : null;
};

export const sceneAt = time => scenes.findLast(scene => time >= scene.start);
export const unit = value => Math.min(1, Math.max(0, value));
export const mix = (from, to, progress) => from + (to - from) * progress;
export const fade = (time, start, length) => {
  const progress = unit((time - start) / length);
  return progress * progress * (3 - 2 * progress);
};

export const drawStory = (screen, elapsed, reducedMotion) => {
  const time = elapsed - pursuitDelay;
  const prologue = elapsed - openingLead;
  const action = time - keyDelay;
  const drop = reducedMotion ? 1 : unit((prologue - 2.70) / 1.34);
  const catchKey = reducedMotion ? 1 : fade(prologue, 4.04, 0.55);
  const setupOpacity = fade(prologue, 2.33, 0.34) * (1 - fade(prologue, 5.52, 0.45));
  const ship = unit((time - 2.76) / 4.7);
  const shipOpacity = fade(time, 2.76, 0.39) * (1 - fade(time, 6.83, 0.63));
  const guardianEnters = fade(time, 7.86, 2.28);
  const guardianLeaves = fade(action, 20.10, 1.40);
  const keyFlight = reducedMotion ? Number(action >= 19.62) : fade(action, 18.74, 0.88);
  const keyFlightOpacity = fade(action, 18.66, 0.18) * (1 - fade(action, 19.60, 0.18));
  const unlocked = fade(action, 19.62, 0.32) * (1 - guardianLeaves);
  const gateArrives = fade(action, 20.22, 1.03);
  const gateOpens = fade(action, 21.66, 2.41);
  const keyPlanPortrait = fade(time, keyPlan - 0.11, 0.37) * (1 - fade(action, 14.99, 0.36));
  const keyInsertionPortrait = fade(action, 15.18, 0.32) * (1 - fade(action, 18.20, 0.45));
  const values = {
    "--key-portrait": Math.max(keyPlanPortrait, keyInsertionPortrait),
    "--key-portrait-time": unit((time - keyPlan) / 3.4),
    "--proposal-plate": fade(elapsed, ceremony.court - 0.20, 0.64),
    "--premiere-opacity": 1 - fade(elapsed, consoleCue - 0.25, 0.50),
    "--premiere-time": unit(elapsed / consoleCue),
    "--letter-opacity": fade(elapsed, ceremony.reply - 0.18, 0.56),
    "--letter-time": unit((elapsed - ceremony.reply) / (ceremony.dissolve - ceremony.reply)),
    "--setup-opacity": setupOpacity,
    "--fallen-key-x": `${mix(67, 40, drop) - 1.5 * catchKey}%`,
    "--fallen-key-y": `${mix(38, 67.5, drop ** 1.44) - 1.4 * catchKey}%`,
    "--fallen-key-spin": `${mix(-12, 228, drop) + 21 * catchKey}deg`,
    "--fallen-key-opacity": fade(prologue, 2.73, 0.22),
    "--ship-x": `${reducedMotion ? 53 : mix(143, -51, ship)}%`,
    "--ship-opacity": shipOpacity,
    "--ship-dip": reducedMotion ? 0 : Math.sin(Math.PI * ship),
    "--guardian-x": `${reducedMotion ? 54 : mix(99, 54, guardianEnters) - 103 * guardianLeaves}%`,
    "--guardian-opacity": guardianEnters * (1 - guardianLeaves),
    "--key-flight-x": `${mix(55.5, 58.1, keyFlight)}%`,
    "--key-flight-y": `${mix(61, 47.6, keyFlight)}%`,
    "--key-flight-spin": `${mix(-18, 342, keyFlight)}deg`,
    "--key-flight-opacity": keyFlightOpacity,
    "--socket-glow": unlocked,
    "--door-open": reducedMotion ? 0 : gateOpens,
    "--door-opacity": gateArrives * (1 - (reducedMotion ? gateOpens : fade(action, 23.8, 0.45))),
    "--gate-light": Math.sin(Math.PI * fade(action, 19.7, 4.7)) * 0.82
  };

  for (const [property, value] of Object.entries(values)) {
    screen.style.setProperty(property, String(value));
  }
};
