/* R1161 倒班排班与作息合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnShift) return;
  window.__xnShift = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var NAME = /^(三班倒|四班两倒|夜班作息|换班记录|疲劳恢复|夜班津贴)$/;

  function navs() {
    var links = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && NAME.test(TXT(a));
    });
    links.forEach(function (a) {
      var bar = a.parentElement;
      if (!bar) return;
      var inNav = /overflow-x-auto/.test(bar.className);
      if (inNav) {
        if (!bar.classList.contains("xn-shift-nav")) {
          bar.classList.add("xn-shift-nav");
          bar.setAttribute("role", "tablist");
        }
        a.classList.add("xn-shift-navlink");
        a.setAttribute("role", "tab");
        var on = /bg-blue-600/.test(a.className) && /text-white/.test(a.className);
        if (on) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
        a.setAttribute("aria-selected", on ? "true" : "false");
      } else if (H(a) < 34) {
        a.classList.add("xn-shift-chip");
      }
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-shift-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
  }

  function run() {
    navs();
    controls();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
