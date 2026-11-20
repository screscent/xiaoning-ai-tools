/* R1124 西装衬衫尺码换算合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnFit) return;
  window.__xnFit = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var UNITS = /^(cm|mm|kg|m|码|号|寸|英寸|%|元)$/;

  function stripToolPrefix(el) {
    [].slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent = node.textContent
          .replace(/^\s*工具[A-Z]\s*·\s*/, "")
          .replace(/^\s*工具[A-Z]\s+/, "")
          .replace(/^\s*[①-⑩]\s*/, "");
      }
    });
  }

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      var p = a.parentElement;
      return p && p.className && p.className.indexOf("flex-wrap") >= 0 && p.querySelectorAll("a").length >= 4 && TXT(a).length >= 2 && TXT(a).length <= 20;
    });
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box.getAttribute("data-xn-fit-tabs") !== "1") {
      box.setAttribute("data-xn-fit-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "正装尺码工具");
    }
    anchors.forEach(function (a) {
      stripToolPrefix(a);
      if (/^工具[A-Z]/.test(TXT(a))) a.textContent = TXT(a).replace(/^工具[A-Z]\s*[·・\-]?\s*/, "");
      var active = a.getAttribute("aria-current") === "page" || (a.className || "").indexOf("bg-slate-900") >= 0;
      a.classList.add("xn-fit-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      var label = TXT(a);
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function options() {
    var byParent = {};
    [].slice.call(document.querySelectorAll("#root button[aria-pressed]")).forEach(function (b) {
      if (!VIS(b)) return;
      var r = b.getBoundingClientRect();
      if (r.height > 60 || r.width > 320) return;
      b.classList.add("xn-fit-opt");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b));
      var p = b.parentElement;
      (byParent[p.className || ""] = byParent[p.className || ""] || { p: p, n: 0 }).n++;
    });
    Object.keys(byParent).forEach(function (k) {
      var g = byParent[k];
      if (g.n < 2) return;
      if (g.p.getAttribute("data-xn-fit-group") === "1") return;
      g.p.setAttribute("data-xn-fit-group", "1");
      g.p.setAttribute("role", "group");
      g.p.setAttribute("aria-label", "选项");
    });
  }

  function labelFor(el) {
    var out = [];
    var n = el.parentElement;
    for (var i = 0; i < 3 && n; i++) {
      var kids = [].slice.call(n.querySelectorAll("div,label,span"));
      for (var k = 0; k < kids.length; k++) {
        var x = kids[k];
        if (x === el || x.contains(el)) continue;
        if (x.children.length) continue;
        var s = TXT(x);
        if (!s || s.length < 2 || s.length > 10) continue;
        if (UNITS.test(s)) continue;
        if (/^\d/.test(s)) continue;
        if (/^(范围|版型|参考)/.test(s)) continue;
        out.push(s);
      }
      n = n.parentElement;
    }
    if (!out.length) return "";
    out.sort(function (a, b) { return a.length - b.length; });
    return out[0];
  }

  function inputs() {
    [].slice.call(document.querySelectorAll("#root input:not([type=checkbox]):not([type=radio]):not([type=range])")).forEach(function (el) {
      if (!VIS(el)) return;
      var cur = el.getAttribute("aria-label") || "";
      var l = labelFor(el);
      if (l) el.setAttribute("aria-label", l + (UNITS.test(cur) ? "（" + cur + "）" : ""));
    });
  }

  function copies() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (!/^一键复制|^复制/.test(s)) return;
      b.classList.add("xn-fit-copy");
      var label = "复制换算结果，复制到剪贴板";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(stripToolPrefix);
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (el) {
      if (el.children.length) return;
      if (/^工具[A-Z]$/.test(TXT(el)) && el.getBoundingClientRect().width <= 60) el.style.display = "none";
    });
  }

  function run() {
    tabs();
    options();
    inputs();
    copies();
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
  window.addEventListener("hashchange", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-current"] });
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
