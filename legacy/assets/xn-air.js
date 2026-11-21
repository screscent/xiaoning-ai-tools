/* R1151 室内空气与温湿度合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnAir) return;
  window.__xnAir = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签（6 个 A） */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root div, #root nav, #root ul")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) {
        var it = c.tagName === "LI" ? c.querySelector("a, button") : (c.tagName === "A" || c.tagName === "BUTTON" ? c : null);
        return !!it && H(c) >= 24 && H(c) <= 90 && TXT(c).length <= 10;
      });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (c) {
      var it = c.tagName === "LI" ? c.querySelector("a, button") : c;
      if (!it) return;
      it.classList.add("xn-air-tab");
      it.setAttribute("role", "tab");
      var on = /\bbg-sky-500\b|\bbg-sky-600\b|\btext-white\b/.test(it.className);
      it.setAttribute("aria-selected", on ? "true" : "false");
      if (on) it.setAttribute("aria-current", "page");
      else it.removeAttribute("aria-current");
      if (!it.getAttribute("aria-label")) it.setAttribute("aria-label", TXT(it));
    });
  }

  /* 复制 / 清空 / 返回 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "一键复制") {
        b.classList.add("xn-air-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
      } else if (s === "清空") {
        b.classList.add("xn-air-clear");
        b.setAttribute("aria-label", "清空本工具输入");
      }
    });
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-air-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 剥离「工具A」前缀 */
  function codes() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3, #root h4")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^工具\s*([A-Z]|\d+)$/.test(TXT(e))) return;
      if (H(e) > 40) return;
      e.style.display = "none";
    });
  }

  function run() {
    tabs();
    actions();
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
