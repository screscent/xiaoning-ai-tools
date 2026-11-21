/* R1149 家政与保洁报价合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnMaid) return;
  window.__xnMaid = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签（6 个 button） */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root div, #root nav, #root ul")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) {
        var it = c.tagName === "LI" ? c.querySelector("a, button") : (c.tagName === "A" || c.tagName === "BUTTON" ? c : null);
        return !!it && H(c) >= 26 && H(c) <= 90 && TXT(c).length <= 10;
      });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (c) {
      var it = c.tagName === "LI" ? c.querySelector("a, button") : c;
      if (!it) return;
      it.classList.add("xn-maid-tab");
      it.setAttribute("role", "tab");
      var on = /\bbg-blue-600\b|\btext-white\b/.test(it.className);
      it.setAttribute("aria-selected", on ? "true" : "false");
      if (on) it.setAttribute("aria-current", "page");
      else it.removeAttribute("aria-current");
      if (!it.getAttribute("aria-label")) it.setAttribute("aria-label", TXT(it));
    });
  }

  /* 复制结果 / 返回 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (TXT(b) !== "复制结果") return;
      b.classList.add("xn-maid-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制报价结果");
    });
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-maid-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  function run() {
    tabs();
    actions();
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
