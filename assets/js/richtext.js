// Unity-style rich text for every text field in web-config.json / Database: <b>, <i>, <color=#hex> …
// Builds real DOM nodes from a whitelist (never innerHTML), so unknown tags or a stray "<" stay plain text.
// The full tag list for the owner is in RICHTEXT.md.

const COLOR = /^(#[0-9a-f]{3,8}|[a-z]{3,20})$/i;
const SIZE = /^(\d{1,3}(\.\d+)?)(px|em|rem|%)?$/i;
const URL_OK = /^(https?:\/\/|mailto:|tel:|#)/i;

// tag → (value) => element | null (null = invalid value → keep the tag as text)
const TAGS = {
  b: () => document.createElement("strong"),
  i: () => document.createElement("em"),
  u: () => document.createElement("u"),
  s: () => document.createElement("s"),
  sup: () => document.createElement("sup"),
  sub: () => document.createElement("sub"),
  color: v => COLOR.test(v) ? span({ color: v }) : null,
  mark: v => !v || COLOR.test(v) ? Object.assign(document.createElement("mark"), { className: "rt-mark" }, v ? { style: `background:${v}` } : {}) : null,
  size: v => { const m = SIZE.exec(v); return m ? span({ fontSize: `${m[1]}${m[3] || "px"}` }) : null; },
  font: v => v === "title" || v === "body" ? span({ fontFamily: `var(--font-${v})` }) : null,
  accent: () => Object.assign(document.createElement("span"), { className: "rt-accent" }),
  link: v => URL_OK.test(v) ? Object.assign(document.createElement("a"), { href: v, className: "rt-link" },
    /^https?:/i.test(v) ? { target: "_blank", rel: "noopener" } : {}) : null,
};
const span = style => { const el = document.createElement("span"); Object.assign(el.style, style); return el; };

// <tag>, <tag=value>, <tag="value">, </tag>, <br>, <br/>
const TOKEN = /<(\/?)([a-z]+)(?:=(?:"([^"]*)"|'([^']*)'|([^>\s]*)))?\s*\/?>/gi;

/** Rich text string → DocumentFragment */
export function parseRich(text) {
  const root = document.createDocumentFragment();
  const stack = [{ tag: "", el: root }];
  const top = () => stack[stack.length - 1].el;
  const str = String(text ?? "");
  let last = 0, m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(str))) {
    const [raw, close, name, q1, q2, bare] = m;
    const tag = name.toLowerCase();
    const value = (q1 ?? q2 ?? bare ?? "").trim();
    let handled = false;
    if (tag === "br" && !close) { flush(m.index); top().append(document.createElement("br")); handled = true; }
    else if (close) {
      const at = stack.findLastIndex(s => s.tag === tag);
      if (at > 0) { flush(m.index); stack.length = at; handled = true; }
    } else if (TAGS[tag]) {
      const el = TAGS[tag](value);
      if (el) { flush(m.index); top().append(el); stack.push({ tag, el }); handled = true; }
    }
    if (handled) last = m.index + raw.length;
  }
  flush(str.length);
  return root;

  function flush(end) { if (end > last) top().append(str.slice(last, end)); last = end; }
}

/** Puts rich text into an element (replaces its content). */
export function setRich(el, text) { el.replaceChildren(parseRich(text)); return el; }

/** Rich text → plain text (tags removed), e.g. for document.title or alt texts. */
export const stripRich = text => parseRich(text).textContent;
