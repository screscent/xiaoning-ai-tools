/* R1143 中文与拼音处理合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnPy) return;
  window.__xnPy = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签：ul > li > a 结构（兼容 button / a） */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root ul, #root nav, #root div")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) {
        var it = c.tagName === "LI" ? c.querySelector("a, button") : (c.tagName === "A" || c.tagName === "BUTTON" ? c : null);
        return !!it && H(c) >= 26 && H(c) <= 80 && TXT(c).length <= 12;
      });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("data-xn-py-tabs", "1");
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (c) {
      var it = c.tagName === "LI" ? c.querySelector("a, button") : c;
      if (!it) return;
      it.classList.add("xn-py-tab");
      if (c.tagName === "LI") c.classList.add("xn-py-tab-item");
      it.setAttribute("role", "tab");
      var on = /\bbg-indigo-600\b|\bbg-violet-600\b|\btext-white\b|\btext-indigo-600\b/.test(it.className);
      it.setAttribute("aria-selected", on ? "true" : "false");
      if (on) it.setAttribute("aria-current", "page");
      if (!it.getAttribute("aria-label")) it.setAttribute("aria-label", TXT(it));
    });
  }

  /* 按钮分级 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (/^生成/.test(s) || /^查找多音字$/.test(s) || /^拼音排序$/.test(s)) {
        b.classList.add("xn-py-primary");
      } else if (s === "升序 A→Z" || s === "降序 Z→A") {
        b.classList.add("xn-py-secondary");
        b.setAttribute("aria-label", s === "升序 A→Z" ? "按拼音升序排列" : "按拼音降序排列");
      } else if (/^复制/.test(s)) {
        b.classList.add("xn-py-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s);
      }
    });
  }

  /* 统计行（汉字数 8 / 已收录 8 …） */
  function stats() {
    [].slice.call(document.querySelectorAll("#root div, #root p, #root span")).forEach(function (e) {
      if (!VIS(e)) return;
      if (e.children.length > 3) return;
      var s = TXT(e);
      if (!/^(汉字数|已收录|未收录|总字符|字数|行数)/.test(s) || s.length > 60) return;
      e.classList.add("xn-py-stat");
    });
  }

  /* 返回链接 */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回/.test(TXT(a))) return;
      if (TXT(a).length > 18) return;
      a.classList.add("xn-py-back");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", "返回工具箱");
    });
  }

  /* 标题里的内部代号（工具X）→ 展示层剥离 */
  function strip() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3, #root h4")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具[A-Z]\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    tabs();
    actions();
    stats();
    back();
    strip();
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
