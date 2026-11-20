/* R1127 文本大小写与命名风格合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnText) return;
  window.__xnText = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签：大小写转换 / 命名风格 */
  function tabs() {
    var btns = BTNS().filter(function (b) {
      var s = TXT(b);
      return (s === "大小写转换" || s === "命名风格") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-text-tabs") !== "1") {
      box.setAttribute("data-xn-text-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "文本工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)bg-blue-600(\s|$)/.test(b.className);
      b.classList.add("xn-text-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 开关：按钮内首个 span 是 w-11 h-6 轨道 */
  function switches() {
    BTNS().forEach(function (b) {
      var track = b.firstElementChild;
      if (!track) return;
      if (!/w-11/.test(track.className || "") || !/h-6/.test(track.className || "")) return;
      var on = /(^|\s)bg-blue-500(\s|$)/.test(track.className);
      b.classList.add("xn-text-switch");
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      var label = TXT(b.parentElement).replace(/[开关]$/, "").trim();
      if (label) b.setAttribute("aria-label", label);
      b.setAttribute("title", (label || "开关") + "：" + (on ? "开" : "关") + "（点击切换）");
    });
  }

  /* 动作按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "转换" || s === "复制全部结果") {
        b.classList.add("xn-text-primary");
      } else if (s === "复制结果" || s === "清空") {
        b.classList.add("xn-text-secondary");
        if (s === "复制结果") b.setAttribute("aria-label", "复制转换结果到剪贴板");
        else b.setAttribute("aria-label", "清空输入与结果");
      }
    });
  }

  /* 标题去 ①–⑩ 序号 */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^[\s\u2460-\u2469]+/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    tabs();
    switches();
    actions();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
