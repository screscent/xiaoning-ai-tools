/* R1193 JSON 工具合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnJkit) return;
  window.__xnJkit = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-jkit-page");
  }

  /* 2) 隐藏通用「使用说明①…④」引导（含与本页无关的「税额」） */
  function hint() {
    ALL("section").forEach(function (s) {
      var tx = TXT(s);
      if (tx.length < 200 && /使用说明/.test(tx) && /税额/.test(tx)) s.classList.add("xn-jkit-hint");
    });
  }

  /* 3) 页签 44 + aria */
  function tabs() {
    var nav = ALL("nav").filter(VIS)[0];
    if (nav) {
      nav.classList.add("xn-jkit-nav");
      if (!nav.getAttribute("role")) nav.setAttribute("role", "tablist");
    }
    ALL("nav a").forEach(function (a) {
      if (!VIS(a)) return;
      a.classList.add("xn-jkit-tab");
      a.setAttribute("role", "tab");
      var on = HAS(a, "bg-blue-600") && HAS(a, "text-white");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 4) 下拉与输入框 */
  function fields() {
    ALL("select").forEach(function (s) {
      if (VIS(s)) s.classList.add("xn-jkit-select");
    });
    ALL("textarea").forEach(function (a) {
      if (VIS(a)) a.classList.add("xn-jkit-area");
    });
  }

  /* 5) 复制/清空/下载等操作 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(复制输入|复制结果|复制|清空|下载.*|重置.*)$/.test(TXT(b))) b.classList.add("xn-jkit-act");
    });
  }

  function run() {
    page();
    hint();
    tabs();
    fields();
    actions();
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
