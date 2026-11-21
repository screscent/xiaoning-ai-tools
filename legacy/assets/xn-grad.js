/* R1195 CSS 渐变生成与预设合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnGrad) return;
  window.__xnGrad = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-grad-page");
  }

  /* 2) 隐藏含深链的引导块 */
  function hint() {
    ALL("section").forEach(function (s) {
      var tx = TXT(s);
      if (tx.length < 400 && /使用说明/.test(tx) && /#\/(gradient|presets)/.test(tx)) s.classList.add("xn-grad-hint");
    });
  }

  /* 3) 药丸页签 44 + aria */
  function tabs() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !/^[①②③④⑤⑥]/.test(TXT(b))) return;
      b.classList.add("xn-grad-tab");
      var box = b.parentElement;
      if (box) {
        box.classList.add("xn-grad-tabs");
        if (!box.getAttribute("role")) box.setAttribute("role", "tablist");
      }
      var on = HAS(b, "bg-slate-900") && HAS(b, "text-white");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 4) 滑块 / 颜色 / 开关 */
  function fields() {
    ALL("input[type=range]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-grad-range");
      i.style.setProperty("height", "32px", "important");
      i.style.setProperty("accent-color", "#7c3aed", "important");
    });
    ALL("input[type=color]").forEach(function (i) {
      if (VIS(i)) i.classList.add("xn-grad-color");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-grad-select");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !HAS(b, "h-6") || !HAS(b, "w-11")) return;
      b.classList.add("xn-grad-switch");
      b.setAttribute("role", "switch");
      var on = HAS(b, "bg-slate-900") || HAS(b, "bg-violet-600") || HAS(b, "bg-blue-600");
      b.setAttribute("aria-checked", on ? "true" : "false");
      var lab = b.closest("label");
      var name = lab ? TXT(lab).replace(/^(开关|中间色|开启|启用)+/g, "").trim() : "";
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", name || "中间色");
    });
  }

  function run() {
    page();
    hint();
    tabs();
    fields();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  document.addEventListener("click", schedule, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
