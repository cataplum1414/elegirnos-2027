const testCodeHash = "734a0b9d15f24e7bd0517eea2d5744163e0d79829e3ad07dea1240ea832573e1";

const hash = async value => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
};

export const mountVipClub = () => {
  const form = document.getElementById("vip-form");
  const input = document.getElementById("vip-code");
  const status = document.getElementById("vip-status");
  const pass = document.getElementById("vip-pass");
  if (!form || !input || !status || !pass) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const code = input.value.trim().toUpperCase();
    if (!code) {
      status.textContent = "Escribe el código incluido en tu invitación VIP.";
      input.focus();
      return;
    }

    const valid = await hash(code) === testCodeHash;
    if (!valid) {
      status.textContent = "Ese código no pertenece a la lista de la banda.";
      input.select();
      return;
    }

    status.textContent = "";
    form.hidden = true;
    pass.hidden = false;
    pass.focus();
  });
};
