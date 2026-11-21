/* R1190 雪行计 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnSnow) return;
  window.__xnSnow = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 去内部代号「工具D/E/F」 */
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
    if (el) el.classList.add("xn-snow-page");
  }

  /* 3) 页签 38 → 44；移动端 2 列 */
  function tabs() {
    var list = ALL("nav a").filter(VIS);
    if (!list.length) return;
    var nav = list[0].closest("nav");
    if (nav) nav.classList.add("xn-snow-nav");
    list.forEach(function (a) {
      a.classList.add("xn-snow-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", a.getAttribute("aria-current") === "page" ? "true" : "false");
    });
  }

  /* 4) 数字 / 下拉 */
  function fields() {
    ALL("input[type=number], select").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-snow-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 复制结果 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制结果$/.test(TXT(b))) b.classList.add("xn-snow-copy");
    });
  }

  /* 6) 表格 / 网格 */
  function layout() {
    ALL("table").forEach(function (tb) {
      tb.classList.add("xn-snow-table");
      var wrap = tb.parentElement;
      if (wrap) wrap.setAttribute("tabindex", "0");
    });
    ALL("div.grid").forEach(function (g) {
      var c = g.className || "";
      if (/sm:grid-cols-4/.test(c)) g.classList.add("xn-snow-g4");
      else if (/sm:grid-cols-3/.test(c)) g.classList.add("xn-snow-g3");
      else if (/sm:grid-cols-2/.test(c)) g.classList.add("xn-snow-g2");
    });
  }

  function run() {
    cleanCodeNames();
    page();
    tabs();
    fields();
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
