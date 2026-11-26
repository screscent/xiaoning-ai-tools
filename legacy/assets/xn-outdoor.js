/* 小凝工具站 · 滑板飞盘与射箭增强 xn-outdoor v1
 * 能力：6 工具导航 44h/aria-pressed；h1 34/h2 20 去「工具A-F」/h3 14；
 *       数字 52/22、下拉与文本 52/16；一键复制/清空 44；结果值 28/800；回到顶部。
 * 注入：legacy/qhqp74stfq.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_OUTDOOR__) return;
  window.__XN_OUTDOOR__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TABS = ["滑板尺寸", "飞盘距离", "射箭磅数", "靶纸记分", "护具安全", "器材保养"];

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-od-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      var t = clean(h.textContent);
      var s = t.replace(/^工具[A-F]\s*/, "");
      if (s !== t) h.textContent = s;
      add(h, "xn-od-h2");
    });
    each(document.querySelectorAll("#root h3"), function (h) { if (vis(h)) add(h, "xn-od-h3"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button, #root a"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      add(b, "xn-od-tab");
      var on = /bg-(sky|emerald|green|blue|slate|indigo)-(5|6|7)00/.test(String(b.className)) || /text-white/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "查看：" + t + "（第 " + (TABS.indexOf(t) + 1) + "/6 个工具）");
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-od-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty === "number") add(x, "xn-od-num");
      else if (ty === "text") {
        add(x, "xn-od-text");
        if (x.style.getPropertyValue("font-size") !== "16px") x.style.setProperty("font-size", "16px", "important");
      }
      if (!x.getAttribute("aria-label")) {
        var lab = x.closest("div") && x.closest("div").querySelector("label");
        var n = clean(lab && lab.textContent).replace(/[（(].*$/, "").trim().slice(0, 12);
        if (n) setA(x, "aria-label", n);
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-od-select");
      if (!s.getAttribute("aria-label")) {
        var lab = s.closest("div") && s.closest("div").querySelector("label");
        var n = clean(lab && lab.textContent).replace(/[（(].*$/, "").trim().slice(0, 12);
        if (n) setA(s, "aria-label", n);
      }
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "一键复制") { add(b, "xn-od-copy"); setA(b, "aria-label", "复制当前工具结果"); }
      else if (t === "清空") { add(b, "xn-od-clear"); setA(b, "aria-label", "清空当前工具输入"); }
    });
    each(document.querySelectorAll("#root div, #root span, #root p, #root strong"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (e.closest("button, pre, table, label")) return;
      var t = clean(e.textContent);
      if (!/^[\d.,]+\s*(英寸|mm|kg|m\/s|磅|环|cm|g|°|%|m)?$/.test(t)) return;
      if (parseFloat(getComputedStyle(e).fontSize) >= 18) {
        add(e, "xn-od-val");
        var want = window.matchMedia("(max-width: 639px)").matches ? "24px" : "28px";
        if (e.style.getPropertyValue("font-size") !== want) e.style.setProperty("font-size", want, "important");
        if (e.style.getPropertyValue("font-weight") !== "800") e.style.setProperty("font-weight", "800", "important");
      }
    });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13) add(p, "xn-od-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-od-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 100); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
