/* R1176 屏幕使用与护眼休息合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnEyeCare) return;
  window.__xnEyeCare = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };

  var TAB = /^(屏幕计划|护眼提醒)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-eyecare-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-white(\s|$)/.test(b.className) && /text-emerald-600/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className) && H(b) <= 44) {
        b.classList.add("xn-eyecare-switch");
        var bg = getComputedStyle(b).backgroundColor || "";
        var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        var on = m ? (Number(m[1]) < 200 && Number(m[2]) > 100) : /bg-emerald|bg-green/.test(b.className);
        b.removeAttribute("aria-pressed");
        b.setAttribute("role", "switch");
        b.setAttribute("aria-checked", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换选项");
        return;
      }
      var v = TXT(b);
      if (/^生成计划$/.test(v)) { b.classList.add("xn-eyecare-primary"); return; }
      if (/^(复制计划|清空)$/.test(v)) { b.classList.add("xn-eyecare-action"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root input[type=time], #root select")).forEach(function (f) {
      f.classList.add("xn-eyecare-field");
      if (getComputedStyle(f).fontSize !== "16px") f.style.setProperty("font-size", "16px", "important");
      if (H(f) < 48) f.style.setProperty("min-height", "48px", "important");
    });
  }

  function chips() {
    [].slice.call(document.querySelectorAll("#root span")).forEach(function (s) {
      if (s.children.length || !VIS(s)) return;
      if (/^\d{2}:\d{2}$/.test(TXT(s)) && /font-mono/.test(s.className)) s.classList.add("xn-eyecare-chip");
    });
  }

  function run() {
    tabs();
    buttons();
    fields();
    chips();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "aria-pressed"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
