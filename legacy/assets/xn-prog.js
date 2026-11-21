/* R1196 进度条与环形进度合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnProg) return;
  window.__xnProg = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var TAB = /^(线性进度|环形进度)$/;

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-prog-page");
  }

  /* 2) 页签 44 + aria */
  function tabs() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !TAB.test(TXT(b))) return;
      b.classList.add("xn-prog-tab");
      var box = b.parentElement;
      if (box) {
        if (!box.getAttribute("role")) box.setAttribute("role", "tablist");
      }
      var on = /bg-\[#EFF6FF\]/i.test(b.className) || /text-\[#1d4ed8\]/i.test(b.className);
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 颜色 / 数字 / 下拉 */
  function fields() {
    ALL("input[type=color]").forEach(function (i) {
      if (VIS(i)) i.classList.add("xn-prog-color");
    });
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-prog-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-prog-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 条纹动画开关 */
  function switches() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !HAS(b, "h-6") || !HAS(b, "w-11")) return;
      b.classList.add("xn-prog-switch");
      b.setAttribute("role", "switch");
      var on = HAS(b, "bg-blue-600") || HAS(b, "bg-slate-900") || HAS(b, "bg-[#2563eb]");
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  /* 5) 复制 / 清空 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      var tx = TXT(b);
      if (/^(复制 CSS|复制 HTML|清空)$/.test(tx)) b.classList.add("xn-prog-act");
      else if (tx === "复制" && !b.classList.contains("xn-prog-act")) b.classList.add("xn-prog-copy");
    });
  }

  function run() {
    page();
    tabs();
    fields();
    switches();
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
