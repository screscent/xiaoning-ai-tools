/* 小凝工具站 · 徽章与标签样式增强 xn-badge v1
 * 能力：2 工具标签 46h/aria-pressed；h1 34/h2 20；
 *       主色 52 色块 + HEX 52/16、样式与圆角下拉 52/16、字号 52/22/800；
 *       左侧圆点 46h/aria-pressed；复制 CSS/HTML 46、代码角标复制 44；
 *       代码块深色 13.5；预览棋盘底；回到顶部。
 * 注入：legacy/fwk3ajyqkh.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_BADGE__) return;
  window.__XN_BADGE__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-bd-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-bd-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!/^[①②]\s*(徽章样式|标签组)$/.test(t)) return;
      add(b, "xn-bd-tab");
      var on = /bg-blue-600/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "切换到：" + t.replace(/^[①②]\s*/, ""));
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-bd-card");
      if (/flex-wrap/.test(c) && /bg-(gray|white)-50|bg-white/.test(c) && /gap-2\.5/.test(c)) add(d, "xn-bd-preview");
    });
  }

  function labelOf(el) {
    var box = el.closest("div");
    if (!box) return "";
    var lab = box.querySelector("label");
    return clean(lab && lab.textContent).replace(/[（(].*$/, "").trim().slice(0, 10);
  }

  function markInputs() {
    each(document.querySelectorAll("#root input[type=color]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-bd-color");
      setA(x, "aria-label", "主色");
    });
    each(document.querySelectorAll("#root input[type=text]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-bd-hex");
      if (x.style.getPropertyValue("font-size") !== "16px") x.style.setProperty("font-size", "16px", "important");
      setA(x, "aria-label", "主色十六进制值");
    });
    each(document.querySelectorAll("#root input[type=number]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-bd-num");
      setA(x, "aria-label", labelOf(x) || "字号（像素）");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-bd-select");
      var n = labelOf(s);
      if (n) setA(s, "aria-label", n);
    });
  }

  function markToggles() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "已关闭" && t !== "已开启") return;
      add(b, "xn-bd-toggle");
      setA(b, "aria-pressed", t === "已开启" ? "true" : "false");
      setA(b, "aria-label", "左侧圆点标记（当前" + t.replace("已", "") + "）");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制 CSS") { add(b, "xn-bd-copy"); setA(b, "aria-label", "复制生成的 CSS 代码"); }
      else if (t === "复制 HTML") { add(b, "xn-bd-copy"); setA(b, "aria-label", "复制生成的 HTML 片段"); }
      else if (t === "复制") { add(b, "xn-bd-mini"); setA(b, "aria-label", "复制对应代码"); }
    });
    each(document.querySelectorAll("#root pre"), function (p) { if (vis(p)) add(p, "xn-bd-pre"); });
    each(document.querySelectorAll("#root span, #root div"), function (e) {
      if (!vis(e) || e.children.length || e.closest("pre")) return;
      var t = clean(e.textContent);
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs <= 14 && /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|\d+(\.\d+)?px)$/i.test(t)) add(e, "xn-bd-val");
    });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13.5) add(p, "xn-bd-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-bd-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markToggles(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 80); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
