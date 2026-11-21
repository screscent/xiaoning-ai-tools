/* R1185 鱼缸水族与水质养护合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnAqua) return;
  window.__xnAqua = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var CHIP = /^(阴性草|中性普草|阳性草|无\s*CO2|有\s*CO2|新缸|老滤材|小型鱼|大型鱼)/;

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

  /* 2) 顶部 6 个工具卡（nav）移动端 2 列 */
  function cards() {
    var nav = document.querySelector("#root nav.grid");
    if (nav && nav.querySelectorAll("a").length >= 4) nav.classList.add("xn-aqua-cards");
  }

  /* 3) 数字输入 20 → 16 */
  function fields() {
    ALL("input[type=number]").forEach(function (i) {
      i.classList.add("xn-aqua-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 4) 选项分段 40 → 44 + radio 语义 */
  function chips() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !CHIP.test(TXT(b))) return;
      b.classList.add("xn-aqua-chip");
      b.removeAttribute("aria-pressed");
      b.setAttribute("role", "radio");
      var on = (HAS(b, "bg-teal-50") && HAS(b, "text-teal-700")) || /ring-2/.test(b.className || "") || (HAS(b, "text-white") && /bg-(teal|cyan|emerald)-6/.test(b.className || ""));
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      var g = b.parentElement;
      if (g && !g.getAttribute("role") && g.children.length >= 2) {
        g.setAttribute("role", "radiogroup");
        if (!g.getAttribute("aria-label")) g.setAttribute("aria-label", "选项");
      }
    });
  }

  /* 5) 复制结果 37 → 44 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^复制结果$/.test(TXT(b))) b.classList.add("xn-aqua-copy");
    });
  }

  /* 6) 字段网格：4 列 → 2 列；3 列 → 2 列 + 末项整行 */
  function layout() {
    ALL("div.grid").forEach(function (g) {
      if (g.closest("nav")) return;
      var c = g.className || "";
      if (/sm:grid-cols-3/.test(c)) g.classList.add("xn-aqua-g3");
      else if (/lg:grid-cols-4/.test(c)) g.classList.add("xn-aqua-g2");
      else if (/sm:grid-cols-2/.test(c)) g.classList.add("xn-aqua-g2");
    });
  }

  function run() {
    cleanCodeNames();
    cards();
    fields();
    chips();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
