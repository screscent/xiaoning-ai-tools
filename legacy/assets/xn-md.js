/* R1177 Markdown 转文本与大纲合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnMd) return;
  window.__xnMd = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };
  var NUM = /^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/;

  var TAB = /^(?:[①②③④⑤⑥⑦⑧⑨⑩]\s*)?(转纯文本|标题大纲|链接提取|代码块提取|标题锚点)$/;

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
      b.classList.add("xn-md-tab");
      b.setAttribute("role", "tab");
      stripNum(b);
      var on = /(^|\s)bg-indigo-600(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className) && H(b) <= 30) {
        b.classList.add("xn-md-switch");
        var on = /(^|\s)bg-indigo-600(\s|$)/.test(b.className) || /(^|\s)bg-indigo-500(\s|$)/.test(b.className);
        b.removeAttribute("aria-pressed");
        b.setAttribute("role", "switch");
        b.setAttribute("aria-checked", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) {
          var label = (b.parentElement ? TXT(b.parentElement) : "").split(/[，,。]/)[0].trim();
          b.setAttribute("aria-label", (label || "切换选项").slice(0, 14));
        }
        return;
      }
      var v = TXT(b);
      if (/^从剪贴板粘贴$/.test(v)) { b.classList.add("xn-md-paste"); b.setAttribute("type", "button"); return; }
      if (/^(复制结果|下载 txt|清空)$/.test(v)) { b.classList.add("xn-md-action"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      t.classList.add("xn-md-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-md-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root div, #root span")).forEach(function (e) {
      if (e.children.length || !VIS(e)) return;
      if (/^-?\d+$/.test(TXT(e)) && /font-semibold/.test(e.className)) e.classList.add("xn-md-stat");
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
