/* R1183 行李额与超重费合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnLuggage) return;
  window.__xnLuggage = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 去内部代号「工具F」 */
  function cleanCodeNames() {
    var walker = document.createTreeWalker(document.querySelector("#root"), NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue;
      if (!v || !/工具\s*[A-Z]/.test(v)) return;
      var next = v.replace(/^\s*工具\s*[A-Z]\s*[·:：\-—]?\s*/, "");
      if (next !== v) n.nodeValue = next;
    });
  }

  /* 2) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-lug-page");
  }

  /* 3) 页签 38 → 44；移动端 2 列 */
  function tabs() {
    var list = ALL("nav a").filter(VIS);
    if (!list.length) return;
    var nav = list[0].closest("nav");
    if (nav) nav.setAttribute("aria-label", "行李工具页签");
    var grid = list[0].parentElement;
    if (grid && /grid/.test(grid.className || "")) grid.classList.add("xn-lug-navgrid");
    list.forEach(function (a) {
      a.classList.add("xn-lug-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", a.getAttribute("aria-current") === "page" ? "true" : "false");
    });
  }

  /* 4) 下拉 / 文本 / 数字 */
  function fields() {
    ALL("select").forEach(function (s) {
      s.classList.add("xn-lug-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("min-height", "48px", "important");
    });
    ALL("input").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-lug-field");
      if (i.type === "number") i.style.setProperty("font-size", "16px", "important");
      else i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 开关：24×44 + 名称兜底 */
  function switches() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !/w-11/.test(b.className || "")) return;
      b.classList.add("xn-lug-switch");
      if (!b.getAttribute("role")) b.setAttribute("role", "switch");
      if (!b.getAttribute("aria-label")) {
        var row = b.parentElement;
        var label = row ? (row.querySelector("span,div,p") ? TXT(row.querySelector("span,div,p")) : TXT(row)) : "";
        b.setAttribute("aria-label", (label || "切换选项").slice(0, 18));
      }
    });
  }

  /* 6) 复制按钮 37 → 44 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制/.test(TXT(b))) b.classList.add("xn-lug-copy");
    });
  }

  /* 7) 移动端 2 列网格 */
  function layout() {
    ALL("div.grid").forEach(function (g) {
      if (g.closest("nav")) return;
      var c = g.className || "";
      if (!/grid-cols-2/.test(c) || /grid-cols-1/.test(c)) return;
      if (/sm:grid-cols-(3|4)/.test(c) || /grid-cols-2 gap-2/.test(c)) g.classList.add("xn-lug-grid2");
    });
  }

  function run() {
    cleanCodeNames();
    page();
    tabs();
    fields();
    switches();
    actions();
    layout();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  document.addEventListener("click", schedule, true);
  window.addEventListener("hashchange", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-current", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
