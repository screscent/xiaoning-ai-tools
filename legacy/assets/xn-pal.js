/* R1171 取色与配色提取合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnPal) return;
  window.__xnPal = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };

  var TAB = /^(取色|主色|变量|历史|对比度|配色方案)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b)) && H(b) >= 30 && H(b) <= 60;
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length >= 6) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-pal-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)border-slate-800(\s|$)/.test(b.className) && /(^|\s)text-slate-800(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (/上传图片/.test(v)) { b.classList.add("xn-pal-upload"); return; }
      if (!v && b.querySelector("svg") && (H(b) <= 44 || b.classList.contains("xn-pal-icon"))) {
        b.classList.add("xn-pal-icon");
        b.setAttribute("type", "button");
        var row = b.parentElement ? TXT(b.parentElement).replace(/^[-–—\s]+/, "") : "";
        var key = (row.split(" ")[0] || "").replace(/[^\w#]/g, "");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", key ? "复制 " + key : "复制");
      }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-pal-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root input[type=range]")).forEach(function (r) {
      r.classList.add("xn-pal-range");
      /* 通用皮肤 range 高度 28 为 !important，选择器同权重时后加载生效，仍用内联兜底 */
      if (H(r) < 32) r.style.setProperty("height", "32px", "important");
    });
  }

  function run() {
    tabs();
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
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
