/* R1202 房租押金与水电分摊合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnRent) return;
  window.__xnRent = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-rent-page");
  }

  /* 2) 药丸页签 44 + aria */
  function tabs() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !/^(押金结算|水电分摊)$/.test(TXT(b))) return;
      b.classList.add("xn-rent-tab");
      var box = b.parentElement;
      if (box && !box.getAttribute("role")) box.setAttribute("role", "tablist");
      var on = HAS(b, "bg-gray-800") && HAS(b, "text-white");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 数字 / 下拉 */
  function fields() {
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-rent-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-rent-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 违约扣款开关：补名称与热区（保留 aria-checked） */
  function switches() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !HAS(b, "h-6") || !HAS(b, "w-11")) return;
      b.classList.add("xn-rent-switch");
      if (!b.getAttribute("role")) b.setAttribute("role", "switch");
      if (!b.getAttribute("aria-checked")) b.setAttribute("aria-checked", "false");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "是否有违约扣款");
    });
  }

  /* 5) 复制结果 / 清空 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(复制结果|清空)$/.test(TXT(b))) b.classList.add("xn-rent-act");
    });
  }

  function run() {
    page();
    tabs();
    fields();
    switches();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
