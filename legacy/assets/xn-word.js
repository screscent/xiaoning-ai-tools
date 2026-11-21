/* R1179 词频统计与关键词提取合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnWord) return;
  window.__xnWord = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };
  var NUM = /^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/;

  var TAB = /^(词频统计|关键词提取)$/;

  function stripNum(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue.replace(NUM, "");
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-word-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className) && /(^|\s)text-white(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className) && H(b) <= 44) {
        b.classList.add("xn-word-switch");
        var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className) || /(^|\s)bg-blue-500(\s|$)/.test(b.className);
        b.removeAttribute("aria-pressed");
        b.setAttribute("role", "switch");
        b.setAttribute("aria-checked", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) {
          var prev = b.parentElement && b.parentElement.previousElementSibling;
          var label = prev ? TXT(prev) : "";
          if (!label && b.parentElement) label = TXT(b.parentElement).replace(/开关|切换|^[开关]$/g, "").trim();
          b.setAttribute("aria-label", (label || "切换选项").slice(0, 14));
        }
        return;
      }
      var v = TXT(b);
      if (/^统\s*计$/.test(v) && W(b) > 150) { b.classList.add("xn-word-primary"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      t.classList.add("xn-word-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-word-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 4 张统计卡移动端 1 列→2 列 */
  function grids() {
    [].slice.call(document.querySelectorAll("#root div.grid")).forEach(function (g) {
      if (!/lg:grid-cols-4/.test(g.className)) return;
      if (g.children.length < 3) return;
      g.classList.add("xn-word-grid2");
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(stripNum);
  }

  function run() {
    tabs();
    buttons();
    fields();
    grids();
    headings();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
