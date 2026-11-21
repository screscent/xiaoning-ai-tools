/* R1160 AA 分摊与结算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnAa) return;
  window.__xnAa = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(均分|按项|结算|记录|小费|拼单优惠)$/;
  var LABEL = /^(账单总额|服务费（\d+%）|优惠 \/ 折扣|应分摊总额|每人应付金额)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 30 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-aa-tabbar");
      bar.setAttribute("role", "tablist");
    }
    list.forEach(function (a) {
      a.classList.add("xn-aa-tab");
      a.setAttribute("role", "tab");
      var on = /bg-blue-600/.test(a.className) && /text-white/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-aa-select");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-aa-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  function results() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      var v = TXT(e);
      if (LABEL.test(v)) {
        e.classList.add("xn-aa-label");
        if (getComputedStyle(e).fontSize !== "12.5px") e.style.setProperty("font-size", "12.5px", "important");
        return;
      }
      if (!/^[¥$€][\d,]+(\.\d+)?$/.test(v)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs > 18) return;
      e.classList.add("xn-aa-amount");
      e.style.setProperty("font-size", "18px", "important");
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
