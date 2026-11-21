/* R1189 农历与节气查询合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnLunar) return;
  window.__xnLunar = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 去内部代号「工具E/F」 */
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
    if (el) el.classList.add("xn-lunar-page");
  }

  /* 3) 表单控件 */
  function fields() {
    ALL("input[type=date], input[type=text], input[type=number], select").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-lunar-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 4) 复制按钮 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制结果$/.test(TXT(b))) b.classList.add("xn-lunar-copy");
    });
  }

  /* 5) 复选框整行 */
  function checks() {
    ALL("input[type=checkbox]").forEach(function (c) {
      var row = c.parentElement;
      while (row && !/cursor-pointer/.test(row.className || "")) row = row.parentElement;
      if (row) row.classList.add("xn-lunar-check");
    });
  }

  /* 6) 表格 / 网格 */
  function layout() {
    ALL("table").forEach(function (tb) {
      tb.classList.add("xn-lunar-table");
      var wrap = tb.parentElement;
      if (wrap) wrap.setAttribute("tabindex", "0");
    });
    ALL("div.grid").forEach(function (g) {
      var c = g.className || "";
      if (/sm:grid-cols-4/.test(c) || /(^|\s)grid-cols-4(\s|$)/.test(c)) g.classList.add("xn-lunar-g4");
      else if (/sm:grid-cols-2/.test(c)) g.classList.add("xn-lunar-g2");
    });
  }

  function run() {
    cleanCodeNames();
    page();
    fields();
    actions();
    checks();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
