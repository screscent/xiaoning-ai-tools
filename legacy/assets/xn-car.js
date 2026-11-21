/* R1167 车主用车成本与合规计算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnCar) return;
  window.__xnCar = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(车险|违章|年检|用车成本|保养周期与费用|洗车美容)$/;

  /* 移动端强制 3 列（各工具强调色不同，列数用内联兜底） */
  function applyCols(bar) {
    var n = window.innerWidth <= 640 ? 3 : 6;
    bar.style.setProperty("display", "grid", "important");
    bar.style.setProperty("grid-template-columns", "repeat(" + n + ", minmax(0, 1fr))", "important");
    bar.style.setProperty("gap", "6px", "important");
  }

  window.addEventListener("resize", function () {
    var bar = document.querySelector("#root .xn-car-tabbar");
    if (bar) applyCols(bar);
  });

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 34 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-car-tabbar");
      bar.setAttribute("role", "tablist");
      applyCols(bar);
    }
    list.forEach(function (a) {
      a.classList.add("xn-car-tab");
      a.setAttribute("role", "tab");
      var on = /(^|\s)bg-(blue|amber|emerald|teal|indigo|sky|rose|orange|cyan|violet|green|red)-\d{3}(\s|$)/.test(a.className) && /text-white/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (/^(投保|未投保)$/.test(v) && b.getBoundingClientRect().width > 220) {
        b.classList.add("xn-car-switch");
        b.setAttribute("type", "button");
        return;
      }
      if (v === "复制结果" || v === "清空") {
        b.classList.add("xn-car-btn");
        b.setAttribute("type", "button");
        if (v === "复制结果" && !b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
      }
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-car-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-car-select");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  function amounts() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root div, #root strong, #root dd")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^¥[\d,]+$/.test(TXT(e))) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs === 14) {
        e.classList.add("xn-car-amount");
        e.style.setProperty("font-size", "16px", "important");
        return;
      }
      if (fs === 20) {
        e.classList.add("xn-car-total");
        e.style.setProperty("font-size", "22px", "important");
      }
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
    controls();
    amounts();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
