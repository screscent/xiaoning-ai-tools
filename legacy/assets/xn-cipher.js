/* R1201 凯撒与古典密码合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnCipher) return;
  window.__xnCipher = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-cipher-page");
  }

  /* 2) 隐藏开发者路由串 */
  function hints() {
    ALL("p").forEach(function (p) {
      if (/^#\/[\w-]+$/.test(TXT(p))) p.classList.add("xn-cipher-hint");
    });
  }

  /* 3) 卡片与 CTA */
  function cards() {
    ALL("a").forEach(function (a) {
      if (!VIS(a) || !/进入工具/.test(TXT(a))) return;
      a.classList.add("xn-cipher-card");
      [].slice.call(a.querySelectorAll("div")).forEach(function (d) {
        if (TXT(d) === "进入工具") d.classList.add("xn-cipher-cta");
      });
      if (!a.getAttribute("aria-label")) {
        var h2 = a.querySelector("h2");
        if (h2) a.setAttribute("aria-label", TXT(h2) + "，进入工具");
      }
    });
  }

  function run() {
    page();
    hints();
    cards();
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
