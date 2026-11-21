/* R1147 体检报告指标解读合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnRep) return;
  window.__xnRep = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签（6 个 button，选中为白底） */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root div, #root nav, #root ul")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) {
        var it = c.tagName === "LI" ? c.querySelector("a, button") : (c.tagName === "A" || c.tagName === "BUTTON" ? c : null);
        return !!it && H(c) >= 26 && H(c) <= 90 && TXT(c).length <= 10;
      });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (c) {
      var it = c.tagName === "LI" ? c.querySelector("a, button") : c;
      if (!it) return;
      it.classList.add("xn-rep-tab");
      it.setAttribute("role", "tab");
      var on = /\bbg-white\b/.test(it.className) && !/\bbg-slate-100\b/.test(it.className);
      it.setAttribute("aria-selected", on ? "true" : "false");
      if (on) it.setAttribute("aria-current", "page");
      else it.removeAttribute("aria-current");
      if (!it.getAttribute("aria-label")) it.setAttribute("aria-label", TXT(it));
    });
  }

  /* 按钮 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "开始解读") {
        b.classList.add("xn-rep-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "解读体检指标");
      } else if (s === "复制结果") {
        b.classList.add("xn-rep-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制解读结果");
      }
    });
  }

  /* 结果行与状态徽标 */
  function results() {
    [].slice.call(document.querySelectorAll("#root div, #root p, #root span")).forEach(function (e) {
      if (!VIS(e)) return;
      if (e.children.length > 2) return;
      var s = TXT(e);
      if (/^你的数值/.test(s) && s.length < 80) e.classList.add("xn-rep-line");
      if (/^(正常|偏高|偏低|边缘|未见异常)$/.test(s)) {
        e.classList.add("xn-rep-badge");
      }
    });
  }

  /* 剥离「工具X」前缀 */
  function codes() {
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
    results();
    codes();
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
