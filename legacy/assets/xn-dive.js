/* R1165 潜水与浮潜费用合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnDive) return;
  window.__xnDive = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^\d\s*(装备预算|用气估算|行程费用|安全停留与紧急处置|配重与浮力|潜水日志)/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 34 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-dive-tabbar");
      bar.setAttribute("role", "tablist");
    }
    list.forEach(function (a) {
      a.classList.add("xn-dive-tab");
      a.setAttribute("role", "tab");
      var on = /(^|\s)bg-white(\s|$)/.test(a.className) && /text-cyan-800/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (v === "是" || v === "否") {
        b.classList.add("xn-dive-opt");
        b.setAttribute("type", "button");
        return;
      }
      if (/^复制结果$/.test(v)) {
        b.classList.add("xn-dive-copy");
        b.setAttribute("type", "button");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
      }
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-dive-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-dive-select");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  function amounts() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root div, #root strong")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^¥[\d,]+(\.\d+)?$/.test(TXT(e))) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs < 16 || fs > 20) return;
      e.classList.add("xn-dive-num");
      e.style.setProperty("font-size", "22px", "important");
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
