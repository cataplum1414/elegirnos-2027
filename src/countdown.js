const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

export const mountCountdown = () => {
  const countdown = document.querySelector("[data-countdown]");
  if (!countdown) return;

  const target = Date.parse(countdown.dataset.countdown);
  if (!Number.isFinite(target)) return;

  const digits = countdown.querySelector(".release-countdown__digits");
  const finished = countdown.querySelector(".release-countdown__finished");
  const fields = {
    days: countdown.querySelector("[data-countdown-days]"),
    hours: countdown.querySelector("[data-countdown-hours]"),
    minutes: countdown.querySelector("[data-countdown-minutes]"),
    seconds: countdown.querySelector("[data-countdown-seconds]")
  };
  let timer;

  const update = () => {
    const remaining = Math.max(0, target - Date.now());
    const values = {
      days: Math.floor(remaining / day),
      hours: Math.floor((remaining % day) / hour),
      minutes: Math.floor((remaining % hour) / minute),
      seconds: Math.floor((remaining % minute) / second)
    };

    fields.days.textContent = String(values.days).padStart(3, "0");
    fields.hours.textContent = String(values.hours).padStart(2, "0");
    fields.minutes.textContent = String(values.minutes).padStart(2, "0");
    fields.seconds.textContent = String(values.seconds).padStart(2, "0");
    digits.setAttribute("aria-label", `${values.days} días, ${values.hours} horas, ${values.minutes} minutos y ${values.seconds} segundos para el 2 de julio de 2027`);

    if (remaining > 0) return;
    clearInterval(timer);
    digits.hidden = true;
    finished.hidden = false;
  };

  update();
  if (target > Date.now()) timer = setInterval(update, second);
};
