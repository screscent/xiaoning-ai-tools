/* R1144 保险保额与缴费计算合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnIns) return;
  window.__xnIns = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签（nav > a ×6） */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root nav, #root ul, #root div")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) {
        var it = c.tagName === "LI" ? c.querySelector("a, button") : (c.tagName === "A" || c.tagName === "BUTTON" ? c : null);
        return !!it && H(c) >= 26 && H(c) <= 90 && TXT(c).length <= 12;
      });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (c) {
      var it = c.tagName === "LI" ? c.querySelector("a, button") : c;
      if (!it) return;
      it.classList.add("xn-ins-tab");
      it.setAttribute("role", "tab");
      var on = /\bbg-teal-600\b|\bbg-teal-700\b|\btext-white\b/.test(it.className);
      it.setAttribute("aria-selected", on ? "true" : "false");
      if (on) it.setAttribute("aria-current", "page");
      if (!it.getAttribute("aria-label")) it.setAttribute("aria-label", TXT(it));
    });
  }

  /* 按钮 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "一键复制") {
        b.classList.add("xn-ins-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制测算结果");
      } else if (s === "清空") {
        b.classList.add("xn-ins-secondary");
        b.setAttribute("aria-label", "清空全部输入");
      }
    });
  }

  /* 返回 */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-ins-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 隐藏「工具X」徽标 */
  function codes() {
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^工具[A-Z]$/.test(TXT(e))) return;
      if (H(e) > 40) return;
      e.classList.add("xn-ins-code");
    });
  }

  function run() {
    tabs();
    actions();
    back();
    codes();
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
