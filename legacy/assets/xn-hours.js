/* R1170 工时与时长计算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnHours) return;
  window.__xnHours = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };
  var ROUTE = /^#\/[\w-]+$/;

  /* 路由串：藏掉，避免把开发者路径展示给用户 */
  function routes() {
    [].slice.call(document.querySelectorAll("#root span, #root code, #root div")).forEach(function (e) {
      if (!e.children.length && ROUTE.test(TXT(e))) e.classList.add("xn-hours-route");
    });
  }

  var CODE = /^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/;

  function stripCodes(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue.replace(CODE, "");
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(stripCodes);
    [].slice.call(document.querySelectorAll("#root div.flex.items-center.gap-2.flex-wrap")).forEach(stripCodes);
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      var h = H(b);
      if (/w-11/.test(b.className) && h <= 30) {
        b.classList.add("xn-hours-switch");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换选项");
        return;
      }
      if (/^计算/.test(v) && W(b) > 300) { b.classList.add("xn-hours-calc"); return; }
      if (/^计算|^清空输入/.test(v)) { b.classList.add("xn-hours-action"); return; }
      if (/^复制|^清空/.test(v) && h <= 40) { b.classList.add("xn-hours-mini"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root input, #root select")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-hours-field");
      /* 通用皮肤对 input 的 !important 特异性高（含多个 :not），用内联兜底 */
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      t.classList.add("xn-hours-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
  }

  function numbers() {
    /* 换算结果：等宽 + 中粗 + 深灰 → 18px */
    [].slice.call(document.querySelectorAll("#root span.font-mono, #root p.font-mono, #root div.font-mono")).forEach(function (e) {
      if (!VIS(e) || e.children.length) return;
      var cls = String(e.className || "");
      if (cls.indexOf("font-medium") >= 0 || cls.indexOf("font-semibold") >= 0) e.classList.add("xn-hours-out");
      else e.classList.add("xn-hours-line");
    });
    /* 结果行 12px 等宽（如 1:30）→ 15px */
    [].slice.call(document.querySelectorAll("#root span")).forEach(function (e) {
      if (e.children.length || VIS(e) === false) return;
      if (String(e.className || "") === "font-mono") e.classList.add("xn-hours-line");
    });
  }

  function run() {
    routes();
    headings();
    buttons();
    fields();
    numbers();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
