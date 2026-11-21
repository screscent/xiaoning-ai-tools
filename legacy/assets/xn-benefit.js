/* R1145 公积金医保与津贴计算合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnBen) return;
  window.__xnBen = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具芯片：01–06 */
  function tools() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (H(b) > 60) return;
      var s = TXT(b);
      if (!/^0[1-6]/.test(s.replace(/\s+/g, ""))) return;
      b.classList.add("xn-ben-tool");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s);
      var on = /\bbg-emerald-800\b|\bbg-emerald-700\b|\bbg-green-700\b/.test(b.className);
      if (!b.getAttribute("aria-pressed")) b.setAttribute("aria-pressed", on ? "true" : "false");
      var box = b.parentElement;
      if (box && box.getAttribute("role") !== "tablist" && box.children.length >= 6) box.setAttribute("role", "tablist");
    });
  }

  /* 复制 / 清空 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "一键复制") {
        b.classList.add("xn-ben-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
      } else if (s === "清空") {
        b.classList.add("xn-ben-clear");
        b.setAttribute("aria-label", "清空本工具输入");
      }
    });
  }

  /* 返回 */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-ben-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 剥离「工具X」前缀 + 隐藏 A–F 字母徽标 */
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
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^[A-F]$/.test(TXT(e))) return;
      if (H(e) > 40) return;
      var p = e.parentElement;
      if (!p || !p.querySelector("h1, h2, h3, h4")) return;
      e.classList.add("xn-ben-letter");
    });
  }

  function run() {
    tools();
    actions();
    back();
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
