/* R1199 记账与月度分析合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnLedger) return;
  window.__xnLedger = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };
  var BG = function (el) { return getComputedStyle(el).backgroundColor; };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-ledger-page");
  }

  /* 2) 导航：选中按内联背景色判定 */
  function nav() {
    var n = ALL("nav").filter(VIS)[0];
    if (!n) return;
    n.classList.add("xn-ledger-nav");
    if (!n.getAttribute("role")) n.setAttribute("role", "tablist");
    if (!n.getAttribute("aria-label")) n.setAttribute("aria-label", "记账工具分区");
    [].slice.call(n.querySelectorAll("a")).forEach(function (a) {
      if (!VIS(a)) return;
      var bg = BG(a);
      var on = a.getAttribute("aria-current") === "page" || (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 输入 / 下拉 */
  function fields() {
    ALL("input").forEach(function (i) {
      if (!VIS(i) || i.type === "checkbox" || i.type === "radio") return;
      i.classList.add("xn-ledger-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-ledger-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 支出/收入 分段 → 单选语义 + 44 */
  function segments() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !/^(支出|收入)$/.test(TXT(b))) return;
      b.classList.add("xn-ledger-seg");
      var box = b.parentElement;
      if (box && !box.getAttribute("role")) {
        box.setAttribute("role", "radiogroup");
        box.setAttribute("aria-label", "流水类型");
      }
      var bg = BG(b);
      var on = bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(243, 244, 246)";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 5) 写入流水等主操作 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^(写入流水|保存|导出|重置)$/.test(TXT(b))) b.classList.add("xn-ledger-act");
    });
  }

  function run() {
    page();
    nav();
    fields();
    segments();
    actions();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "aria-current"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
