/* R1158 露营装备与营地费用合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnTent) return;
  window.__xnTent = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(装备|营地|补给|装载与打包清单|往返路程油耗|营火炊具)(装备|营地|补给|装载|油耗|营火)?$/;
  var CHIP = /^(春|夏|秋|冬|自驾|公共交通|徒步背负|帐篷|天幕|房车|民宿营地)$/;
  var LABEL = /^(装备预算合计（购置）|人均预算)$/;

  function tabs() {
    var bar = null;
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (bar) return;
      if (!VIS(a)) return;
      if (!TAB.test(TXT(a))) return;
      var p = a.parentElement;
      if (!p || p.children.length !== 6) return;
      bar = p;
    });
    if (!bar) return;
    bar.classList.add("xn-tent-tabbar");
    bar.setAttribute("role", "tablist");
    applyCols(bar);
    [].slice.call(bar.children).forEach(function (a) {
      if (a.tagName !== "A") return;
      a.classList.add("xn-tent-tab");
      a.setAttribute("role", "tab");
      var on = /bg-emerald-600/.test(a.className) && /text-white/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  /* 列数用内联 !important 兜底（运行期 Tailwind 样式会压过外链） */
  function applyCols(bar) {
    var n = window.innerWidth <= 640 ? 3 : 6;
    bar.style.setProperty("grid-template-columns", "repeat(" + n + ", minmax(0, 1fr))", "important");
    bar.style.setProperty("gap", "6px", "important");
  }

  window.addEventListener("resize", function () {
    var bar = document.querySelector("#root .xn-tent-tabbar");
    if (bar) applyCols(bar);
  });

  function chips() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!CHIP.test(TXT(b))) return;
      b.classList.add("xn-tent-chip");
      b.setAttribute("type", "button");
      var on = /bg-emerald-600/.test(b.className);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function copyBtn() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (TXT(b) !== "复制结果") return;
      b.classList.add("xn-tent-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
    });
  }

  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-tent-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  function results() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      var v = TXT(e);
      if (LABEL.test(v)) {
        e.classList.add("xn-tent-label");
        if (getComputedStyle(e).fontSize !== "12.5px") e.style.setProperty("font-size", "12.5px", "important");
        return;
      }
      if (!/^¥[\d,]+(\.\d+)?$/.test(v)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs < 16 || fs > 22) return;
      e.classList.add("xn-tent-num");
      e.style.setProperty("font-size", "24px", "important");
    });
  }

  function summary() {
    [].slice.call(document.querySelectorAll("#root details > summary")).forEach(function (s) {
      s.style.setProperty("min-height", "44px", "important");
      s.style.setProperty("display", "flex", "important");
      s.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    tabs();
    chips();
    copyBtn();
    inputs();
    results();
    summary();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
