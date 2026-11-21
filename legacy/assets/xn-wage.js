/* R1175 时薪与通勤成本合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnWage) return;
  window.__xnWage = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };
  var ROUTE = /^#\/[\w-]+$/;

  var TAB = /^(实际时薪|通勤成本|涨薪换算|城市对比|通勤方式对比)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button, #root a")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    var hash = location.hash || "";
    var active = list.filter(function (b) {
      var href = b.getAttribute("href") || "";
      return hash && href === hash;
    })[0];
    if (!active && !hash) active = list[0];
    list.forEach(function (b) {
      b.classList.add("xn-wage-tab");
      b.setAttribute("role", "tab");
      var on = b === active || /(^|\s)bg-blue-600(\s|$)/.test(b.className) || /(^|\s)bg-blue-500(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      if (on && !/bg-blue-600|bg-blue-500/.test(b.className)) b.classList.add("xn-wage-on");
      else b.classList.remove("xn-wage-on");
    });
  }

  function routes() {
    [].slice.call(document.querySelectorAll("#root span, #root div, #root code")).forEach(function (e) {
      if (!e.children.length && ROUTE.test(TXT(e))) e.classList.add("xn-wage-route");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className) && H(b) <= 44) {
        b.classList.add("xn-wage-switch");
        var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className) || /(^|\s)bg-blue-500(\s|$)/.test(b.className) || b.getAttribute("aria-checked") === "true";
        b.removeAttribute("aria-pressed");
        b.setAttribute("role", "switch");
        b.setAttribute("aria-checked", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) {
          var label = (b.parentElement ? TXT(b.parentElement) : "").replace(/开关|切换/g, "").split(/开启|，|,|。|\./)[0].trim();
          b.setAttribute("aria-label", (label || "切换选项").slice(0, 14));
        }
        return;
      }
      var v = TXT(b);
      if (/^计算/.test(v) && W(b) > 300) { b.classList.add("xn-wage-primary"); return; }
      if (/^(复制结果|清空|清空重置|开始对比)$/.test(v)) { b.classList.add("xn-wage-action"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-wage-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    tabs();
    routes();
    buttons();
    fields();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  window.addEventListener("hashchange", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed", "aria-checked"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
