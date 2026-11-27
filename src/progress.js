export const mountReadingProgress = () => {
  const progress = document.getElementById("reading-progress");
  const fill = document.getElementById("reading-progress-fill");
  if (!progress || !fill) return;

  let frameRequested = false;
  let previousValue = -1;

  const update = () => {
    frameRequested = false;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const value = maxScroll === 0 ? 0 : Math.round((window.scrollY / maxScroll) * 100);
    fill.style.width = `${value}%`;

    if (value !== previousValue) {
      progress.setAttribute("aria-valuenow", String(value));
      progress.setAttribute("aria-valuetext", `${value} % recorrido`);
      previousValue = value;
    }
  };

  const requestUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
};
