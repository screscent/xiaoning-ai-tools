/* R1178 体温血压记录与指标解读合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnVital) return;
  window.__xnVital = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };
  var NUM = /^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/;

  var TAB = /^(趋势记录|血压解读)$/;

  function stripNum(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue.replace(NUM, "");
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-vital-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-blue-50(\s|$)/.test(b.className) && /text-blue-600/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className) && H(b) <= 30) {
        b.classList.add("xn-vital-switch");
        b.removeAttribute("aria-pressed");
        if (!b.getAttribute("role")) b.setAttribute("role", "switch");
        if (!b.getAttribute("aria-checked")) b.setAttribute("aria-checked", "false");
        if (!b.getAttribute("aria-label")) {
          var label = (b.parentElement ? TXT(b.parentElement) : "").replace(/开关|切换/g, "").split(/[，,。]/)[0].trim();
          b.setAttribute("aria-label", (label || "切换选项").slice(0, 14));
        }
        return;
      }
      var v = TXT(b);
      if (/^分析记录$/.test(v)) { b.classList.add("xn-vital-primary"); return; }
      if (/^(复制结果|清空)$/.test(v)) { b.classList.add("xn-vital-action"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      t.classList.add("xn-vital-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
    [].slice.call(document.querySelectorAll("#root span")).forEach(function (s) {
      if (s.children.length || !VIS(s)) return;
      if (/→/.test(TXT(s)) && /text-xs/.test(s.className)) s.classList.add("xn-vital-delta");
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(stripNum);
  }

  function run() {
    tabs();
    buttons();
    fields();
    headings();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
