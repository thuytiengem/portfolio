// "Skip the intro once" flag shared by the project pages and the home page (sessionStorage = this tab only).
const KEY = "portfolio-skip-intro";

/** project page: true = the next home-page load opens without the intro; false = play it (Home / logo) */
export function skipNextIntro(on) {
  try { on ? sessionStorage.setItem(KEY, "1") : sessionStorage.removeItem(KEY); } catch {}
}

/** home page: reads and clears the flag */
export function consumeSkipIntro() {
  try { const v = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); return v; } catch { return false; }
}
