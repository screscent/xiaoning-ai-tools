/* R1204 出行成本计算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnRoad) return;
  window.__xnRoad = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-road-page");
  }

  /* 2) 页签 44 + aria */
  function tabs() {
    var n = ALL("nav").filter(VIS)[0];
    if (n && !n.getAttribute("role")) n.setAttribute("role", "tablist");
    ALL("nav a").forEach(function (a) {
      if (!VIS(a)) return;
      a.classList.add("xn-road-tab");
      var on = a.getAttribute("aria-current") === "page";
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 数字 */
  function fields() {
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-road-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 复制结果 / 清空 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(复制结果|清空)$/.test(TXT(b))) b.classList.add("xn-road-act");
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-current"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
