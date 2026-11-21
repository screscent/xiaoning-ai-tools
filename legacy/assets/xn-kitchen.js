/* R1192 厨房调味与酱汁配比合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnKitchen) return;
  window.__xnKitchen = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var SAUCE = /^(糖醋汁|鱼香汁|红烧汁|凉拌汁|宫保汁|照烧汁)$/;

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-kitchen-page");
  }

  /* 2) 隐藏开发者路由提示 */
  function hint() {
    ALL("p").forEach(function (p) {
      if (/六个标签对应地址|#juice|#marinade/.test(TXT(p))) p.classList.add("xn-kitchen-hint");
    });
  }

  /* 3) 页签 aria */
  function tabs() {
    ALL("nav a").forEach(function (a) {
      if (!VIS(a)) return;
      a.classList.add("xn-kitchen-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", a.getAttribute("aria-current") === "page" ? "true" : "false");
    });
  }

  /* 4) 数字 */
  function fields() {
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-kitchen-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 酱汁预设：aria-pressed → radio，44 高 */
  function chips() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !SAUCE.test(TXT(b))) return;
      var was = b.getAttribute("aria-pressed") === "true" || (HAS(b, "bg-amber-500") && HAS(b, "text-white"));
      b.classList.add("xn-kitchen-chip");
      b.removeAttribute("aria-pressed");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", was ? "true" : "false");
      b.setAttribute("tabindex", was ? "0" : "-1");
      var g = b.parentElement;
      if (g && !g.getAttribute("role")) {
        g.setAttribute("role", "radiogroup");
        g.setAttribute("aria-label", "酱汁类型");
      }
    });
  }

  /* 6) 复制结果 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制结果$/.test(TXT(b))) b.classList.add("xn-kitchen-copy");
    });
  }

  /* 7) 网格 */
  function layout() {
    ALL("div.grid").forEach(function (g) {
      var c = g.className || "";
      if (/grid-cols-3/.test(c)) g.classList.add("xn-kitchen-g3");
      else if (/grid-cols-2/.test(c)) g.classList.add("xn-kitchen-g2");
    });
  }

  function run() {
    page();
    hint();
    tabs();
    fields();
    chips();
    actions();
    layout();
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
