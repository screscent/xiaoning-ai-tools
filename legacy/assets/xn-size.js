/* R1188 鞋服尺码换算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnSize) return;
  window.__xnSize = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\s|$)").test(el.className || ""); };
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
    if (el) el.classList.add("xn-size-page");
  }

  /* 3) 页签 42 → 48；移动端 2 列 */
  function tabs() {
    var list = ALL("nav a").filter(VIS);
    if (!list.length) return;
    var nav = list[0].closest("nav");
    if (nav) nav.classList.add("xn-size-nav");
    list.forEach(function (a) {
      a.classList.add("xn-size-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", a.getAttribute("aria-current") === "page" ? "true" : "false");
      a.removeAttribute("aria-current");
      if (a.getAttribute("aria-selected") === "true") a.setAttribute("aria-current", "page");
    });
  }

  /* 4) 分段按钮：36/37 → 44 + radio */
  function chips() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || b.closest("nav")) return;
      var h = b.getBoundingClientRect().height;
      var fs = parseFloat(getComputedStyle(b).fontSize);
      if (h > 44 || fs > 14) return;
      var g = b.parentElement;
      if (!g || g.children.length < 2) return;
      b.classList.add("xn-size-chip");
      b.removeAttribute("aria-pressed");
      b.setAttribute("role", "radio");
      var on = HAS(b, "bg-[#2563eb]") && HAS(b, "text-white");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      if (!g.getAttribute("role")) {
        g.setAttribute("role", "radiogroup");
        g.setAttribute("aria-label", "选项");
      }
    });
  }

  /* 5) 数字输入 */
  function fields() {
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-size-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 6) 复制按钮 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制/.test(TXT(b))) b.classList.add("xn-size-copy");
    });
  }

  /* 7) 表格与网格 */
  function layout() {
    ALL("table").forEach(function (tb) {
      tb.classList.add("xn-size-table");
      var wrap = tb.parentElement;
      if (wrap) {
        wrap.setAttribute("tabindex", "0");
        if (!wrap.getAttribute("aria-label")) wrap.setAttribute("aria-label", "尺码对照表，可横向滚动");
      }
    });
    ALL("div.grid").forEach(function (g) {
      if (g.closest("nav")) return;
      var c = g.className || "";
      if (/sm:grid-cols-4/.test(c) || /(^|\s)grid-cols-4(\s|$)/.test(c)) g.classList.add("xn-size-g4");
      else if (/sm:grid-cols-3/.test(c)) g.classList.add("xn-size-g3");
      else if (/sm:grid-cols-2/.test(c)) g.classList.add("xn-size-g2");
    });
  }

  function run() {
    cleanCodeNames();
    page();
    tabs();
    chips();
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
