/* R1187 月历与年历合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnCal) return;
  window.__xnCal = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var TAB = /^(月历|年历|周数|打印|季度财年|年度进度)$/;

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
    if (el) el.classList.add("xn-cal-page");
  }

  /* 3) 页签 37 → 44；移动端 3 列 */
  function tabs() {
    var all = ALL("button").filter(function (b) { return VIS(b) && TAB.test(TXT(b)); });
    if (!all.length) return;
    var wrap = all[0].parentElement;
    /* 只处理同一容器内的 6 个页签，避免把面板里的「打印」动作按钮也算进来 */
    var list = all.filter(function (b) { return b.parentElement === wrap; });
    if (wrap) wrap.classList.add("xn-cal-tabs");
    list.forEach(function (b) {
      b.classList.add("xn-cal-tab");
      b.setAttribute("role", "tab");
      var on = b.getAttribute("aria-current") === "page" || (HAS(b, "bg-white") && HAS(b, "text-blue-600"));
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  /* 4) 下拉 / 日期 / 数字 */
  function fields() {
    ALL("select, input[type=date]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-cal-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-cal-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 复制 / 导出按钮 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(复制.*|导出 HTML)$/.test(TXT(b))) b.classList.add("xn-cal-action");
    });
  }

  /* 6) 网格恢复 */
  function layout() {
    ALL("div.grid").forEach(function (g) {
      var c = g.className || "";
      if (g.children.length === 12 && g.querySelector("table")) { g.classList.add("xn-cal-months"); return; }
      if (/lg:grid-cols-5/.test(c)) { g.classList.add("xn-cal-g5"); return; }
      if (/sm:grid-cols-3/.test(c)) { g.classList.add("xn-cal-g3"); return; }
      if (/lg:grid-cols-4/.test(c) || /sm:grid-cols-4/.test(c)) { g.classList.add("xn-cal-g4"); return; }
      if (/sm:grid-cols-2/.test(c) && g.querySelector("table")) g.classList.add("xn-cal-months");
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
