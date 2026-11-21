/* R1197 颜色转换与对比度合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnColor) return;
  window.__xnColor = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-color-page");
  }

  /* 2) 分段页签 44 + aria */
  function tabs() {
    ALL("nav a").forEach(function (a) {
      if (!VIS(a)) return;
      a.classList.add("xn-color-tab");
      var on = HAS(a, "bg-white") && HAS(a, "text-indigo-600");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
    var nav = ALL("nav").filter(VIS)[0];
    if (nav && !nav.getAttribute("role")) nav.setAttribute("role", "tablist");
  }

  /* 3) 文本 / 颜色 / 下拉 */
  function fields() {
    ALL("input[type=text]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-color-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("input[type=color]").forEach(function (i) {
      if (VIS(i)) i.classList.add("xn-color-input");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-color-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 开始检测 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && TXT(b) === "开始检测") b.classList.add("xn-color-act");
    });
  }

  function run() {
    page();
    tabs();
    fields();
    actions();
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
