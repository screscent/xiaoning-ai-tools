/* 小凝工具站 · 花盆与土壤配比增强 xn-pot v1
 * 能力：6 工具页签 44h/aria-pressed；h1 34/h2 20 去「工具A-F」；数字 52/22+读屏名；
 *       选项 chips 44h；主按钮 48；结果 dt 13.5/dd 16/短数字 24；复制 44；回到顶部。
 * 注入：legacy/puzcrj3a4t.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_POT__) return;
  window.__XN_POT__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TOOLS = ["花盆尺寸", "土壤配比", "施肥浇水", "换盆修根", "浇水频率", "病虫害"];

  function stripToolPrefix() {
    var walker = document.createTreeWalker(document.querySelector("#root") || document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && /^(SCRIPT|STYLE|TEXTAREA|PRE)$/.test(n.parentElement.tagName)) continue;
      if (/工具[A-F]\s*/.test(n.nodeValue)) nodes.push(n);
    }
    each(nodes, function (t) { t.nodeValue = t.nodeValue.replace(/工具[A-F]\s*/g, ""); });
  }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-pt-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-pt-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TOOLS.indexOf(t) < 0) return;
      add(b, "xn-pt-tab");
      if (b.parentElement) add(b.parentElement, "xn-pt-nav");
      setA(b, "aria-label", "切换到：" + t);
    });
  }

  function markChips() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b) || !b.hasAttribute("aria-pressed")) return;
      if (TOOLS.indexOf(clean(b.textContent)) >= 0) return;
      add(b, "xn-pt-chip");
      if (!b.getAttribute("data-xn-chip")) {
        var lab = b.closest("fieldset") || b.parentElement;
        setA(b, "data-xn-chip", "1");
      }
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-pt-card");
    });
  }

  function markFields() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty !== "number") return;
      add(x, "xn-pt-num");
      if (x.getAttribute("data-xn-name")) return;
      var aria = x.getAttribute("aria-label") || "";
      var n = aria.replace(/[（(][^）)]*[）)]\s*$/, "").trim();
      if (n) { setA(x, "aria-label", n); setA(x, "data-xn-name", "1"); }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (vis(s)) add(s, "xn-pt-select");
    });
  }

  function markResults() {
    each(document.querySelectorAll("#root dt"), function (d) { if (vis(d)) add(d, "xn-pt-dt"); });
    each(document.querySelectorAll("#root dd"), function (d) {
      if (!vis(d)) return;
      add(d, "xn-pt-dd");
      var t = clean(d.textContent);
      if (/^[\d.,]+\s*(cm|L|%|元|g|kg)$/i.test(t) || (t.length <= 8 && /^[\d.,]/.test(t))) add(d, "xn-pt-big");
    });
    each(document.querySelectorAll("#root h3, #root span, #root div"), function (e) {
      if (!vis(e) || e.children.length || e.tagName === "DD") return;
      var t = clean(e.textContent);
      if (/结果$/.test(t) && t.length <= 12 && parseFloat(getComputedStyle(e).fontSize) <= 15) add(e, "xn-pt-sec");
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (/^计\s*算/.test(t)) add(b, "xn-pt-primary");
      else if (t === "复制结果") { add(b, "xn-pt-copy"); setA(b, "aria-label", "复制当前计算结果"); }
    });
    each(document.querySelectorAll("#root table"), function (t) { if (vis(t)) add(t, "xn-pt-table"); });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-pt-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { stripToolPrefix(); markHeads(); markTabs(); markChips(); markCards(); markFields(); markResults(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 100); }, true);
  document.addEventListener("change", function () { window.setTimeout(tick, 100); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
