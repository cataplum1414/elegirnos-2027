import { validateVipCode } from "./vip-club.js?v=20261128-10";

const gate = document.getElementById("vip-gate");
const booklet = document.getElementById("vip-booklet");
const form = document.getElementById("vip-page-form");
const input = document.getElementById("vip-page-code");
const status = document.getElementById("vip-page-status");
const exit = document.getElementById("vip-exit");

const openBooklet = () => {
  gate.hidden = true;
  booklet.hidden = false;
  booklet.focus?.();
  scrollTo(0, 0);
};

if (sessionStorage.getItem("elegirnos-vip-demo") === "unlocked") openBooklet();

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!input.value.trim()) {
    status.textContent = "Escribe el código incluido en tu invitación VIP.";
    input.focus();
    return;
  }
  if (!await validateVipCode(input.value)) {
    status.textContent = "Ese código no pertenece a la lista de la banda.";
    input.select();
    return;
  }
  sessionStorage.setItem("elegirnos-vip-demo", "unlocked");
  status.textContent = "";
  openBooklet();
});

exit.addEventListener("click", () => {
  sessionStorage.removeItem("elegirnos-vip-demo");
  booklet.hidden = true;
  gate.hidden = false;
  input.value = "";
  input.focus();
});
