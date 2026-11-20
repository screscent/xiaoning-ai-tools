/* R1125 居家烘焙换算合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnBake) return;
  window.__xnBake = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      var p = a.parentElement;
      return p && p.className && p.className.indexOf("overflow-x-auto") >= 0 && p.querySelectorAll("a").length >= 4 && TXT(a).length >= 2 && TXT(a).length <= 16;
    });
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box.getAttribute("data-xn-bake-tabs") !== "1") {
      box.setAttribute("data-xn-bake-tabs", "1");
      box.classList.add("xn-bake-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "烘焙工具");
    }
    anchors.forEach(function (a) {
      var active = a.getAttribute("aria-current") === "page";
      a.classList.add("xn-bake-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  function copies() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var aria = b.getAttribute("aria-label") || "";
      var s = TXT(b);
      if (!/^复制/.test(aria) && !/^复制/.test(s)) return;
      if (!VIS(b)) return;
      b.classList.add("xn-bake-copy");
      if (!b.getAttribute("title")) b.setAttribute("title", aria || s);
    });
  }

  function run() {
    tabs();
    copies();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  window.addEventListener("hashchange", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
