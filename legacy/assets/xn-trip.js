/* R1203 差旅报销与机酒预算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnTrip) return;
  window.__xnTrip = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var GROUPS = [
    ["一线", "新一线", "二线", "三线及以下"],
    ["普通", "经理", "总监"],
    ["需要", "不需要"]
  ];

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-trip-page");
  }

  /* 2) 分区页签 44 + aria */
  function tabs() {
    var n = ALL("nav").filter(VIS)[0];
    if (n && !n.getAttribute("role")) n.setAttribute("role", "tablist");
    ALL("nav a").forEach(function (a) {
      if (!VIS(a)) return;
      a.classList.add("xn-trip-tab");
      var on = a.getAttribute("aria-current") === "page";
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 出差天数 */
  function fields() {
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-trip-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 三组预设 → radio，去掉自动 ✓ */
  function chips() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !b.hasAttribute("aria-pressed")) return;
      var tx = TXT(b);
      var gi = -1;
      GROUPS.forEach(function (g, i) { if (g.indexOf(tx) >= 0) gi = i; });
      if (gi < 0) return;
      var was = b.getAttribute("aria-pressed") === "true" || (HAS(b, "bg-sky-600") && HAS(b, "text-white")) || (HAS(b, "bg-blue-600") && HAS(b, "text-white"));
      b.classList.add("xn-trip-chip");
      b.removeAttribute("aria-pressed");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", was ? "true" : "false");
      b.setAttribute("tabindex", was ? "0" : "-1");
      var box = b.parentElement;
      if (box && !box.getAttribute("role")) {
        box.setAttribute("role", "radiogroup");
        box.setAttribute("aria-label", ["城市等级", "职级", "是否需要住宿"][gi]);
      }
    });
  }

  /* 5) 复制结果 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制结果$/.test(TXT(b))) b.classList.add("xn-trip-copy");
    });
  }

  function run() {
    page();
    tabs();
    fields();
    chips();
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
