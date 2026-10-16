// YouTube video frames: thumbnail first, then the player is created and starts
// (muted, as browsers require) when the frame scrolls into view; pauses when it leaves.
import { h } from "./utils.js";

const PLAY_ICON = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 18 L84 50 L30 82 Z" fill="#fff"/></svg>`;
const players = new Map();      // frame element → controller
let apiPromise = null;

function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = reject;
    document.head.append(s);
    setTimeout(() => reject(new Error("YouTube API timeout")), 10000);
  });
  return apiPromise;
}

const observer = "IntersectionObserver" in window
  ? new IntersectionObserver(entries => entries.forEach(e => {
      const p = players.get(e.target);
      if (!p) return;
      if (e.intersectionRatio >= 0.55) p.play(); else p.pause();
    }), { threshold: [0, 0.55] })
  : null;

/** createVideo() inside the cyan HUD frame (4 glowing corner brackets) used on every page */
export const framedVideo = video => h("div", { class: "hud-frame" }, createVideo(video),
  ["c1", "c2", "c3", "c4"].map(c => h("i", { class: c, "aria-hidden": "true" })));

/** video = { youtube: "id", orientation: "landscape" | "portrait" } */
export function createVideo(video = {}) {
  const id = video.youtube;
  const portrait = video.orientation === "portrait";
  const frame = h("div", { class: `video${portrait ? " portrait" : ""}` });
  if (!id) return frame;

  const slot = h("div", { class: "yt-slot" });
  const thumb = h("img", { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: "", loading: "lazy" });
  const btn = h("button", { class: "video-play", type: "button", "aria-label": "Play video" });
  btn.innerHTML = PLAY_ICON;
  frame.append(slot, thumb, btn);

  let player = null, wantPlay = false, creating = false;
  const ctrl = {
    play() {
      wantPlay = true;
      pauseOthers(frame);
      if (player?.playVideo) return player.playVideo();
      if (creating) return;
      creating = true;
      loadApi().then(YT => {
        player = new YT.Player(slot, {
          videoId: id,
          playerVars: { autoplay: 1, mute: 1, playsinline: 1, rel: 0, modestbranding: 1, loop: 1, playlist: id },
          events: {
            onReady: e => { frame.classList.add("loaded"); e.target.mute(); if (wantPlay) e.target.playVideo(); },
          },
        });
      }).catch(() => {
        // API blocked → plain embed (still autoplays muted)
        slot.replaceWith(h("iframe", {
          src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&loop=1&playlist=${id}`,
          allow: "autoplay; encrypted-media; picture-in-picture; fullscreen", allowfullscreen: true, title: "YouTube video",
        }));
        frame.classList.add("loaded");
      });
    },
    pause() {
      wantPlay = false;
      player?.pauseVideo?.();
    },
  };
  btn.addEventListener("click", () => ctrl.play());
  players.set(frame, ctrl);
  observer?.observe(frame);
  return frame;
}

function pauseOthers(current) {
  players.forEach((p, el) => { if (el !== current) p.pause(); });
}
