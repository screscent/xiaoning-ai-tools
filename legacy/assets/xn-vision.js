/* R1122 眼镜与视力保护速查合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnVision) return;
  window.__xnVision = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function tabs() {
    var links = [].slice.call(document.querySelectorAll("#root [href^='#/']")).filter(function (a) {
      return a.tagName === "A" && VIS(a) && a.getBoundingClientRect().height > 40 && TXT(a).length <= 14;
    });
    if (!links.length) return;
    var box = links[0].parentElement;
    if (box && box.getAttribute("data-xn-vision-tabs") !== "1") {
      box.setAttribute("data-xn-vision-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "视力保护工具");
    }
    links.forEach(function (a) {
      var active = a.getAttribute("aria-current") === "page";
      a.classList.add("xn-vision-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
      var name = a.querySelector('[class*="truncate"]') || a.querySelector("span");
      if (name) name.classList.add("xn-vision-tab-name");
      if (!a.getAttribute("data-xn-vision-key")) {
        a.setAttribute("data-xn-vision-key", "1");
        a.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            a.click();
          }
        });
      }
    });
  }

  function options() {
    [].slice.call(document.querySelectorAll("#root button[aria-pressed]")).forEach(function (b) {
      if (!VIS(b)) return;
      var r = b.getBoundingClientRect();
      if (r.height > 60 || r.width > 320) return;
      b.classList.add("xn-vision-opt");
    });
  }

  function copies() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (!/^复制/.test(s)) return;
      b.classList.add("xn-vision-copy");
      var label = s + "，复制到剪贴板";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
    });
  }

  function run() {
    tabs();
    options();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-current"] });
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
