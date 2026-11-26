/* 小凝工具站 · JSON 转多语言模型增强 xn-codegen v1
 * 能力：5 个工具入口卡 132h/hover/前往工具 13/800；h1 34/h2 20；
 *       JSON 文本域 260/15.5 等宽；代码块深色 13.5；复制/清空 44h；
 *       下拉 52/16；说明 13.5；回到顶部。
 * 注入：legacy/uiadeexjku.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_CODEGEN__) return;
  window.__XN_CODEGEN__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-cg-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-cg-h2"); });
  }

  function markCards() {
    each(document.querySelectorAll("#root *"), function (e) {
      if (e.children.length || clean(e.textContent) !== "前往工具") return;
      if (!vis(e)) return;
      add(e, "xn-cg-goto");
      var card = e.closest("a") || e.closest('div[class*="rounded"]');
      if (card) add(card, "xn-cg-card");
    });
    each(document.querySelectorAll("#root section, #root div"), function (s) {
      if (!vis(s)) return;
      var c = String(s.className);
      if (/rounded-2xl/.test(c) && /border/.test(c)) add(s, "xn-cg-sec");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-cg-text");
      var sec = t.closest("section");
      var h = sec && sec.querySelector("h2");
      var title = clean(h && h.textContent);
      setA(t, "aria-label", (title ? title + "：" : "") + "输入 JSON");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-cg-select");
      if (!s.getAttribute("aria-label")) {
        var lab = s.closest("label");
        var n = clean(lab && lab.textContent).replace(/^([^\s（(]+).*$/, "$1");
        if (n) setA(s, "aria-label", n);
      }
    });
  }

  function markCode() {
    each(document.querySelectorAll("#root pre"), function (p) {
      if (vis(p)) add(p, "xn-cg-pre");
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制") { add(b, "xn-cg-copy"); setA(b, "aria-label", "复制生成的代码"); }
      else if (t === "清空") { add(b, "xn-cg-clear"); setA(b, "aria-label", "清空输入与结果"); }
    });
  }

  function markNotes() {
    each(document.querySelectorAll("#root p, #root li, #root div"), function (e) {
      if (!vis(e)) return;
      var t = clean(e.textContent);
      if (!t || e.children.length) return;
      if (/·\s*\d+\s*行/.test(t) || /^说明[:：]/.test(t)) add(e, "xn-cg-meta");
      else if (/^生成结果/.test(t)) add(e, "xn-cg-meta");
    });
    each(document.querySelectorAll("#root p"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 14) add(p, "xn-cg-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-cg-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markCards(); markInputs(); markCode(); markNotes(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 150); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
